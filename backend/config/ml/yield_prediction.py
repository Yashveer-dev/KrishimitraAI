import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import json
import os
from typing import Dict, Tuple, Any

class CropYieldPredictor:
    def __init__(self):
        self.rf_model = None
        self.xgb_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.target_column = 'Actual_Yield'
        
    def load_and_preprocess_data(self, csv_path: str) -> pd.DataFrame:
        """Load and preprocess the crop yield dataset"""
        df = pd.read_csv(csv_path)
        
        # Handle missing values
        df = df.dropna()
        
        # Encode categorical variables
        categorical_columns = ['Crop_Name', 'Season', 'Crop_Type', 'District', 'Potential_Diseases']
        
        for col in categorical_columns:
            if col in df.columns:
                le = LabelEncoder()
                df[col + '_encoded'] = le.fit_transform(df[col])
                self.label_encoders[col] = le
        
        # Define feature columns
        self.feature_columns = [
            'Crop_Name_encoded', 'Season_encoded', 'Crop_Type_encoded', 'District_encoded',
            'Soil_Nitrogen', 'Soil_Phosphorus', 'Soil_Potassium', 'Soil_pH', 'Soil_Moisture',
            'Historical_Temperature', 'Historical_Rainfall', 'Historical_Humidity',
            'Potential_Diseases_encoded'
        ]
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features and target for training"""
        X = df[self.feature_columns].values
        y = df[self.target_column].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y
    
    def train_random_forest(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train Random Forest model with hyperparameter tuning"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Hyperparameter grid
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        # Grid search with cross-validation
        rf = RandomForestRegressor(random_state=42)
        grid_search = GridSearchCV(
            rf, param_grid, cv=5, scoring='neg_mean_squared_error', n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        
        # Best model
        self.rf_model = grid_search.best_estimator_
        
        # Predictions and metrics
        y_pred = self.rf_model.predict(X_test)
        
        metrics = {
            'model_type': 'Random Forest',
            'best_params': grid_search.best_params_,
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2_score': r2_score(y_test, y_pred),
            'feature_importance': dict(zip(self.feature_columns, self.rf_model.feature_importances_))
        }
        
        return metrics
    
    def train_xgboost(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train XGBoost model with hyperparameter tuning"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Hyperparameter grid
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 0.9, 1.0]
        }
        
        # Grid search with cross-validation
        xgb_reg = xgb.XGBRegressor(random_state=42)
        grid_search = GridSearchCV(
            xgb_reg, param_grid, cv=5, scoring='neg_mean_squared_error', n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        
        # Best model
        self.xgb_model = grid_search.best_estimator_
        
        # Predictions and metrics
        y_pred = self.xgb_model.predict(X_test)
        
        metrics = {
            'model_type': 'XGBoost',
            'best_params': grid_search.best_params_,
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2_score': r2_score(y_test, y_pred),
            'feature_importance': dict(zip(self.feature_columns, self.xgb_model.feature_importances_))
        }
        
        return metrics
    
    def compare_models(self, rf_metrics: Dict, xgb_metrics: Dict) -> Dict[str, Any]:
        """Compare both models and return the best one"""
        comparison = {
            'Random Forest': rf_metrics,
            'XGBoost': xgb_metrics
        }
        
        # Determine best model based on R2 score
        best_model = 'Random Forest' if rf_metrics['r2_score'] > xgb_metrics['r2_score'] else 'XGBoost'
        comparison['best_model'] = best_model
        
        return comparison
    
    def predict_yield(self, input_data: Dict[str, Any]) -> Dict[str, float]:
        """Make yield prediction for new data"""
        if not self.rf_model and not self.xgb_model:
            raise ValueError("Models not trained yet. Please train models first.")
        
        # Prepare input data
        input_df = pd.DataFrame([input_data])
        
        # Encode categorical variables
        for col, encoder in self.label_encoders.items():
            if col in input_data:
                try:
                    input_df[col + '_encoded'] = encoder.transform([input_data[col]])
                except ValueError:
                    # Handle unseen categories
                    input_df[col + '_encoded'] = 0
        
        # Prepare features
        X_input = input_df[self.feature_columns].values
        X_input_scaled = self.scaler.transform(X_input)
        
        # Make predictions
        predictions = {}
        if self.rf_model:
            predictions['random_forest'] = float(self.rf_model.predict(X_input_scaled)[0])
        if self.xgb_model:
            predictions['xgboost'] = float(self.xgb_model.predict(X_input_scaled)[0])
        
        # Average prediction if both models available
        if len(predictions) == 2:
            predictions['ensemble'] = (predictions['random_forest'] + predictions['xgboost']) / 2
        
        return predictions
    
    def save_models(self, model_dir: str):
        """Save trained models and preprocessors"""
        os.makedirs(model_dir, exist_ok=True)
        
        if self.rf_model:
            joblib.dump(self.rf_model, os.path.join(model_dir, 'random_forest_model.pkl'))
        
        if self.xgb_model:
            joblib.dump(self.xgb_model, os.path.join(model_dir, 'xgboost_model.pkl'))
        
        joblib.dump(self.scaler, os.path.join(model_dir, 'scaler.pkl'))
        
        with open(os.path.join(model_dir, 'label_encoders.pkl'), 'wb') as f:
            joblib.dump(self.label_encoders, f)
        
        with open(os.path.join(model_dir, 'feature_columns.json'), 'w') as f:
            json.dump(self.feature_columns, f)
    
    def load_models(self, model_dir: str):
        """Load trained models and preprocessors"""
        if os.path.exists(os.path.join(model_dir, 'random_forest_model.pkl')):
            self.rf_model = joblib.load(os.path.join(model_dir, 'random_forest_model.pkl'))
        
        if os.path.exists(os.path.join(model_dir, 'xgboost_model.pkl')):
            self.xgb_model = joblib.load(os.path.join(model_dir, 'xgboost_model.pkl'))
        
        self.scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        
        with open(os.path.join(model_dir, 'feature_columns.json'), 'r') as f:
            self.feature_columns = json.load(f)
        
        with open(os.path.join(model_dir, 'label_encoders.pkl'), 'rb') as f:
            self.label_encoders = joblib.load(f)

def main():
    # Initialize predictor
    predictor = CropYieldPredictor()
    
    # Load and preprocess data
    data_path = '../../data/raw/crop_yield_dataset.csv'
    df = predictor.load_and_preprocess_data(data_path)
    
    print(f"Dataset loaded with {len(df)} samples")
    print(f"Features: {predictor.feature_columns}")
    
    # Prepare features
    X, y = predictor.prepare_features(df)
    
    # Train Random Forest
    print("\nTraining Random Forest...")
    rf_metrics = predictor.train_random_forest(X, y)
    print(f"Random Forest R² Score: {rf_metrics['r2_score']:.4f}")
    print(f"Random Forest RMSE: {rf_metrics['rmse']:.4f}")
    
    # Train XGBoost
    print("\nTraining XGBoost...")
    xgb_metrics = predictor.train_xgboost(X, y)
    print(f"XGBoost R² Score: {xgb_metrics['r2_score']:.4f}")
    print(f"XGBoost RMSE: {xgb_metrics['rmse']:.4f}")
    
    # Compare models
    comparison = predictor.compare_models(rf_metrics, xgb_metrics)
    print(f"\nBest Model: {comparison['best_model']}")
    
    # Save models
    model_dir = '../../data/models'
    predictor.save_models(model_dir)
    print(f"\nModels saved to {model_dir}")
    
    # Test prediction
    test_input = {
        'Crop_Name': 'Rice',
        'Season': 'Kharif',
        'Crop_Type': 'Cereal',
        'District': 'Khordha',
        'Soil_Nitrogen': 45.2,
        'Soil_Phosphorus': 18.5,
        'Soil_Potassium': 32.1,
        'Soil_pH': 6.8,
        'Soil_Moisture': 65.5,
        'Historical_Temperature': 32.5,
        'Historical_Rainfall': 1250.0,
        'Historical_Humidity': 78.2,
        'Potential_Diseases': 'Bacterial Leaf Blight'
    }
    
    prediction = predictor.predict_yield(test_input)
    print(f"\nSample Prediction: {prediction}")
    
    # Save training metrics
    with open(os.path.join(model_dir, 'training_metrics.json'), 'w') as f:
        json.dump(comparison, f, indent=2)
    
    return predictor, comparison

if __name__ == "__main__":
    predictor, metrics = main()
