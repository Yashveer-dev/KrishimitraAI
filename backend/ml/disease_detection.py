import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class QuestionType(Enum):
    SYMPTOM = "symptom"
    ENVIRONMENTAL = "environmental"
    PEST = "pest"
    TIMELINE = "timeline"
    LOCATION = "location"

class SeverityLevel(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

@dataclass
class DiseaseQuestion:
    id: int
    question_text: str
    question_type: QuestionType
    options: List[str]
    weight: float
    order_index: int

@dataclass
class Disease:
    id: int
    name: str
    affected_crop: str
    symptoms: str
    cause: str
    severity_level: SeverityLevel
    treatment_recommendations: str
    prevention_measures: str
    government_subsidy_eligible: bool
    subsidy_details: str

@dataclass
class DiseaseRule:
    disease_id: int
    conditions: Dict[str, str]  # question_id -> expected_answer
    confidence_score: float

class DiseaseDetectionEngine:
    def __init__(self):
        self.questions: List[DiseaseQuestion] = []
        self.diseases: Dict[int, Disease] = {}
        self.rules: List[DiseaseRule] = []
        self.current_question_index = 0
        self.user_answers: Dict[int, str] = {}
        self.diagnosed_disease: Optional[Disease] = None
        
        self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self):
        """Initialize the disease detection knowledge base"""
        # Define questions for rice diseases
        self.questions = [
            DiseaseQuestion(
                id=1,
                question_text="What symptoms do you see on the leaves?",
                question_type=QuestionType.SYMPTOM,
                options=["Yellow lesions with white centers", "Elliptical brown spots", "Grayish white lesions", "No visible symptoms"],
                weight=0.9,
                order_index=1
            ),
            DiseaseQuestion(
                id=2,
                question_text="Are there lesions on the stem or leaf sheath?",
                question_type=QuestionType.SYMPTOM,
                options=["Grayish white lesions on stem", "No stem lesions", "Brown spots on sheath", "Black lesions on stem"],
                weight=0.8,
                order_index=2
            ),
            DiseaseQuestion(
                id=3,
                question_text="What is the current weather condition?",
                question_type=QuestionType.ENVIRONMENTAL,
                options=["High humidity (80%+)", "Moderate humidity (60-80%)", "Low humidity (<60%)", "Very dry conditions"],
                weight=0.7,
                order_index=3
            ),
            DiseaseQuestion(
                id=4,
                question_text="Have you noticed any insects or pests?",
                question_type=QuestionType.PEST,
                options=["Small flying insects", "No insects visible", "Caterpillars", "Aphids"],
                weight=0.6,
                order_index=4
            ),
            DiseaseQuestion(
                id=5,
                question_text="When did you first notice these symptoms?",
                question_type=QuestionType.TIMELINE,
                options=["Last 2-3 days", "Last week", "2-3 weeks ago", "More than a month ago"],
                weight=0.5,
                order_index=5
            ),
            DiseaseQuestion(
                id=6,
                question_text="Which part of the field is most affected?",
                question_type=QuestionType.LOCATION,
                options=["Low-lying areas", "Entire field uniformly", "Edges of the field", "Specific patches"],
                weight=0.4,
                order_index=6
            )
        ]
        
        # Define diseases
        self.diseases = {
            1: Disease(
                id=1,
                name="Bacterial Leaf Blight",
                affected_crop="Rice",
                symptoms="Yellow to white lesions along leaf margins, later becoming white with gray centers. Lesions may coalesce causing leaf death.",
                cause="Xanthomonas oryzae pv. oryzae bacterium",
                severity_level=SeverityLevel.HIGH,
                treatment_recommendations="Apply copper-based bactericides. Use resistant varieties. Avoid excessive nitrogen fertilization.",
                prevention_measures="Use balanced fertilization, ensure proper drainage, use disease-free seeds, maintain field hygiene.",
                government_subsidy_eligible=True,
                subsidy_details="50% subsidy on copper-based bactericides under Plant Protection Scheme. Contact local agriculture office."
            ),
            2: Disease(
                id=2,
                name="Rice Blast",
                affected_crop="Rice",
                symptoms="Diamond-shaped or spindle-shaped lesions with gray centers and brown margins. Lesions may have yellow halo.",
                cause="Magnaporthe oryzae fungus",
                severity_level=SeverityLevel.CRITICAL,
                treatment_recommendations="Apply systemic fungicides like tricyclazole or azoxystrobin. Use resistant varieties.",
                prevention_measures="Avoid late planting, maintain proper plant spacing, use balanced fertilization, ensure good air circulation.",
                government_subsidy_eligible=True,
                subsidy_details="75% subsidy on blast-resistant seeds and fungicides. Available through Kisan Credit Card scheme."
            ),
            3: Disease(
                id=3,
                name="Sheath Blight",
                affected_crop="Rice",
                symptoms="Oblong, irregular lesions on leaf sheaths near water line. Lesions are grayish white with brown margins.",
                cause="Rhizoctonia solani fungus",
                severity_level=SeverityLevel.MEDIUM,
                treatment_recommendations="Apply validamycin or thiophanate-methyl fungicides. Proper water management.",
                prevention_measures="Avoid excessive nitrogen, maintain proper plant density, ensure good field drainage.",
                government_subsidy_eligible=False,
                subsidy_details="No specific subsidy available. Contact local extension office for guidance."
            )
        }
        
        # Define disease rules
        self.rules = [
            DiseaseRule(
                disease_id=1,  # Bacterial Leaf Blight
                conditions={
                    "1": "Yellow lesions with white centers",
                    "3": "High humidity (80%+)",
                    "4": "Small flying insects"
                },
                confidence_score=0.85
            ),
            DiseaseRule(
                disease_id=2,  # Rice Blast
                conditions={
                    "1": "Elliptical brown spots",
                    "3": "High humidity (80%+)",
                    "6": "Low-lying areas"
                },
                confidence_score=0.90
            ),
            DiseaseRule(
                disease_id=3,  # Sheath Blight
                conditions={
                    "2": "Grayish white lesions on stem",
                    "3": "Moderate humidity (60-80%)",
                    "6": "Entire field uniformly"
                },
                confidence_score=0.80
            )
        ]
    
    def get_current_question(self) -> Optional[DiseaseQuestion]:
        """Get the current question to ask"""
        if self.current_question_index < len(self.questions):
            return self.questions[self.current_question_index]
        return None
    
    def submit_answer(self, question_id: int, answer: str) -> bool:
        """Submit an answer and move to next question"""
        # Convert both to integers for comparison
        question_id_int = int(question_id)
        expected_id_int = int(self.questions[self.current_question_index].id)
        
        if question_id_int != expected_id_int:
            return False
        
        self.user_answers[question_id_int] = answer
        self.current_question_index += 1
        return True
    
    def diagnose_disease(self) -> Tuple[Optional[Disease], float]:
        """Diagnose disease based on user answers"""
        disease_scores = {}
        
        for rule in self.rules:
            matching_conditions = 0
            total_conditions = len(rule.conditions)
            
            for question_id, expected_answer in rule.conditions.items():
                if int(question_id) in self.user_answers:
                    if self.user_answers[int(question_id)] == expected_answer:
                        matching_conditions += 1
            
            # Calculate confidence based on matching conditions
            match_ratio = matching_conditions / total_conditions
            final_confidence = match_ratio * rule.confidence_score
            
            if final_confidence > 0.3:  # Minimum threshold
                disease_scores[rule.disease_id] = final_confidence
        
        if not disease_scores:
            return None, 0.0
        
        # Find disease with highest score
        best_disease_id = max(disease_scores, key=disease_scores.get)
        confidence = disease_scores[best_disease_id]
        
        if confidence < 0.5:
            return None, confidence
        
        self.diagnosed_disease = self.diseases[best_disease_id]
        return self.diagnosed_disease, confidence
    
    def reset_diagnosis(self):
        """Reset the diagnosis process"""
        self.current_question_index = 0
        self.user_answers = {}
        self.diagnosed_disease = None
    
    def get_diagnosis_summary(self) -> Optional[Dict]:
        """Get summary of the diagnosis"""
        if not self.diagnosed_disease:
            return None
        
        return {
            "disease": {
                "name": self.diagnosed_disease.name,
                "severity": self.diagnosed_disease.severity_level.value,
                "symptoms": self.diagnosed_disease.symptoms,
                "cause": self.diagnosed_disease.cause
            },
            "treatment": {
                "recommendations": self.diagnosed_disease.treatment_recommendations,
                "prevention": self.diagnosed_disease.prevention_measures
            },
            "subsidy": {
                "eligible": self.diagnosed_disease.government_subsidy_eligible,
                "details": self.diagnosed_disease.subsidy_details
            },
            "answers": self.user_answers
        }
    
    def get_progress_percentage(self) -> float:
        """Get progress percentage of Q&A session"""
        return (self.current_question_index / len(self.questions)) * 100

class DiseaseDetectionAPI:
    def __init__(self):
        self.session_data = {}  # In production, use Redis or database
    
    def start_diagnosis_session(self, session_id: str) -> Dict:
        """Start a new diagnosis session"""
        # Create a new engine instance for each session
        engine = DiseaseDetectionEngine()
        engine.reset_diagnosis()
        
        self.session_data[session_id] = {
            "started": True,
            "current_question": engine.get_current_question(),
            "progress": 0.0,
            "engine": engine  # Store engine instance with session
        }
        
        return {
            "session_id": session_id,
            "question": engine.get_current_question(),
            "progress": 0.0,
            "total_questions": len(engine.questions)
        }
    
    def submit_answer(self, session_id: str, question_id: int, answer: str) -> Dict:
        """Submit answer for current question"""
        if session_id not in self.session_data:
            return {"error": "Invalid session"}
        
        # Get session-specific engine
        engine = self.session_data[session_id]["engine"]
        
        success = engine.submit_answer(question_id, answer)
        
        if not success:
            return {"error": "Invalid question ID or order"}
        
        current_question = engine.get_current_question()
        progress = engine.get_progress_percentage()
        
        self.session_data[session_id]["current_question"] = current_question
        self.session_data[session_id]["progress"] = progress
        
        response = {
            "success": True,
            "next_question": current_question,
            "progress": progress,
            "completed": current_question is None
        }
        
        # If diagnosis is complete, provide results
        if current_question is None:
            diagnosis, confidence = engine.diagnose_disease()
            if diagnosis:
                response["diagnosis"] = engine.get_diagnosis_summary()
                response["confidence"] = confidence
        
        return response
    
    def get_session_status(self, session_id: str) -> Dict:
        """Get current session status"""
        if session_id not in self.session_data:
            return {"error": "Invalid session"}
        
        return {
            "session_id": session_id,
            "current_question": self.session_data[session_id]["current_question"],
            "progress": self.session_data[session_id]["progress"]
        }

def main():
    """Test the disease detection system"""
    engine = DiseaseDetectionEngine()
    
    print("=== Crop Disease Detection System ===")
    print(f"Total questions: {len(engine.questions)}")
    print(f"Known diseases: {len(engine.diseases)}")
    
    # Simulate a diagnosis session
    print("\n=== Sample Diagnosis Session ===")
    
    # Simulate answers for Bacterial Leaf Blight
    test_answers = {
        1: "Yellow lesions with white centers",
        2: "No stem lesions",
        3: "High humidity (80%+)",
        4: "Small flying insects",
        5: "Last 2-3 days",
        6: "Low-lying areas"
    }
    
    for question in engine.questions:
        print(f"\nQ{question.id}: {question.question_text}")
        print(f"Options: {', '.join(question.options)}")
        
        answer = test_answers.get(question.id)
        print(f"Answer: {answer}")
        
        engine.submit_answer(question.id, answer)
    
    # Get diagnosis
    disease, confidence = engine.diagnose_disease()
    
    print(f"\n=== Diagnosis Results ===")
    if disease:
        print(f"Disease: {disease.name}")
        print(f"Confidence: {confidence:.2f}")
        print(f"Severity: {disease.severity_level.value}")
        print(f"Subsidy Eligible: {disease.government_subsidy_eligible}")
        
        summary = engine.get_diagnosis_summary()
        print(f"\nTreatment: {summary['treatment']['recommendations']}")
        print(f"Prevention: {summary['treatment']['prevention']}")
    else:
        print("No disease could be confidently identified")
        print(f"Best match confidence: {confidence:.2f}")

if __name__ == "__main__":
    main()
