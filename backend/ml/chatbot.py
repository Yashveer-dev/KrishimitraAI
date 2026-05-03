import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import aiohttp
from datetime import datetime

class Language(Enum):
    ENGLISH = "en"
    ODIA = "or"

class QueryCategory(Enum):
    WEATHER = "weather"
    DISEASE = "disease"
    MARKET = "market"
    GENERAL = "general"

@dataclass
class ChatResponse:
    text: str
    language: Language
    category: QueryCategory
    confidence: float
    follow_up_questions: List[str]

class BilingualChatbot:
    def __init__(self):
        self.conversation_history = []
        self.language_patterns = self._initialize_language_patterns()
        self.knowledge_base = self._initialize_knowledge_base()
        self.translation_cache = {}
        
    def _initialize_language_patterns(self) -> Dict[str, Language]:
        """Initialize patterns to detect language"""
        return {
            # English indicators
            "weather": Language.ENGLISH,
            "rain": Language.ENGLISH,
            "temperature": Language.ENGLISH,
            "disease": Language.ENGLISH,
            "pest": Language.ENGLISH,
            "price": Language.ENGLISH,
            "market": Language.ENGLISH,
            "crop": Language.ENGLISH,
            "soil": Language.ENGLISH,
            "fertilizer": Language.ENGLISH,
            
            # Odia indicators (transliterated)
            "ଆବହାବା": Language.ODIA,
            "ବୃଷ୍ଟି": Language.ODIA,
            "ତାପମାତ୍ର": Language.ODIA,
            "ରୋଗ": Language.ODIA,
            "ପୋକ": Language.ODIA,
            "ଦାମ": Language.ODIA,
            "ବଜାର": Language.ODIA,
            "ଫସଲ": Language.ODIA,
            "ମାଟି": Language.ODIA,
            "ସାର": Language.ODIA,
            
            # Common Odia words
            "କଣ": Language.ODIA,
            "କାହିଁକି": Language.ODIA,
            "କେମିତି": Language.ODIA,
            "ଅଛି": Language.ODIA,
            "ନାହିଁ": Language.ODIA,
        }
    
    def _initialize_knowledge_base(self) -> Dict[str, Dict]:
        """Initialize knowledge base for common queries"""
        return {
            "weather": {
                "en": {
                    "patterns": [
                        r"weather.*today",
                        r"rain.*forecast",
                        r"temperature.*today",
                        r"climate.*condition"
                    ],
                    "responses": [
                        "Today's weather is partly cloudy with temperature between 25-32°C and 65% humidity.",
                        "Light rain expected in the evening. Good for paddy fields.",
                        "Temperature is optimal for most crops. No extreme weather conditions."
                    ],
                    "follow_up": [
                        "Do you need weather forecast for the next 3 days?",
                        "Would you like specific advice for your crop based on current weather?",
                        "Do you need irrigation recommendations?"
                    ]
                },
                "or": {
                    "patterns": [
                        r"ଆଜି.*ଆବହାବା",
                        r"ବୃଷ୍ଟି.*ପୂର୍ବାନୁମାନ",
                        r"ଆଜି.*ତାପମାତ୍ର",
                        r"ଜଳବାୟୁ.*ଅବସ୍ଥା"
                    ],
                    "responses": [
                        "ଆଜି ଆଂଶିକ ମେଘୁଆ ଆବହାବା ଅଛି ଏବଂ ତାପମାତ୍ର ୨୫-୩୨°C ମଧ୍ୟରେ ଅଛି।",
                        "ସନ୍ଧ୍ୟାରେ ହାଲୁକା ବୃଷ୍ଟି ଆଶା କରାଯାଉଛି। ଧାନ କ୍ଷେତ ପାଇଁ ଭଲ।",
                        "ଅଧିକାଂଶ ଫସଲ ପାଇଁ ତାପମାତ୍ର ଉତ୍ତମ ଅଛି।"
                    ],
                    "follow_up": [
                        "ଆପଣ ଆସନ୍ତା ୩ ଦିନର ଆବହାବା ପୂର୍ବାନୁମାନ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆପଣଙ୍କର ଫସଲ ପାଇଁ ବର୍ତ୍ତମାନ ଆବହାବା ଉପରେ ଆଧାର କରି ନିର୍ଦ୍ଦିଷ୍ଟ ପରାମର୍ଶ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆପଣ ଜଳସେଚନ ସୁପାରିଶ ଚାହୁଁଛନ୍ତି କି?"
                    ]
                }
            },
            "disease": {
                "en": {
                    "patterns": [
                        r"crop.*disease",
                        r"plant.*problem",
                        r"yellow.*leaves",
                        r"pest.*control"
                    ],
                    "responses": [
                        "I can help you identify crop diseases. Please describe the symptoms you're seeing.",
                        "Common rice diseases include blast, bacterial leaf blight, and sheath blight. What symptoms do you observe?",
                        "For accurate diagnosis, please check our disease detection tool for detailed questions."
                    ],
                    "follow_up": [
                        "Would you like to start the disease detection process?",
                        "Can you describe the leaf symptoms?",
                        "Have you noticed any insects on the plants?"
                    ]
                },
                "or": {
                    "patterns": [
                        r"ଫସଲ.*ରୋଗ",
                        r"ଉଦ୍ଭିଦ.*ସମସ୍ୟା",
                        r"ହଳଦିଆ.*ପତ୍ର",
                        r"ପୋକ.*ନିୟନ୍ତ୍ରଣ"
                    ],
                    "responses": [
                        "ମୁଁ ଆପଣଙ୍କୁ ଫସଲ ରୋଗ ଚିହ୍ନିବାରେ ସାହାଯ୍ୟ କରିପାରିବି। ଦୟାକରି ଆପଣ ଯାହା ଦେଖୁଛନ୍ତି ତାହା ବର୍ଣ୍ଣନା କରନ୍ତୁ।",
                        "ସାଧାରଣ ଧାନ ରୋଗ ମଧ୍ଯରେ ବ୍ଲାଷ୍ଟ, ବ୍ୟାକ୍ଟେରିଆଲ ଲିଫ୍ ବ୍ଲାଇଟ୍, ଏବଂ ଶିଥ୍ ବ୍ଲାଇଟ୍ ଅନ୍ତର୍ଭୁକ୍ତ।",
                        "ସଠିକ୍ ରୋଗ ନିର୍ଣ୍ଣୟ ପାଇଁ, ଦୟାକରି ଆମର ରୋଗ ଚିହ୍ନା ଉପକରଣ ବ୍ୟବହାର କରନ୍ତୁ।"
                    ],
                    "follow_up": [
                        "ଆପଣ ରୋଗ ଚିହ୍ନା ପ୍ରକ୍ରିୟା ଆରମ୍ଭ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆପଣ ପତ୍ର ଲକ୍ଷଣ ବର୍ଣ୍ଣନା କରିପାରିବେ କି?",
                        "ଆପଣ ଉଦ୍ଭିଦରେ କୌଣସି କୀଟ ଦେଖିଛନ୍ତି କି?"
                    ]
                }
            },
            "market": {
                "en": {
                    "patterns": [
                        r"crop.*price",
                        r"market.*rate",
                        r"mandi.*price",
                        r"sell.*price"
                    ],
                    "responses": [
                        "Current rice price in Khordha mandi is ₹2100 per quintal with increasing trend.",
                        "Pigeon pea prices are strong at ₹6500 per quintal. Good time to sell.",
                        "Market prices vary by district. Which specific crop and location are you interested in?"
                    ],
                    "follow_up": [
                        "Which district's mandi prices are you looking for?",
                        "Do you need prices for a specific crop?",
                        "Would you like price trend analysis for the next month?"
                    ]
                },
                "or": {
                    "patterns": [
                        r"ଫସଲ.*ଦାମ",
                        r"ବଜାର.*ହାର",
                        r"ମଣ୍ଡି.*ଦାମ",
                        r"ବିକି.*ଦାମ"
                    ],
                    "responses": [
                        "ଖୋର୍ଦ୍ଧା ମଣ୍ଡିରେ ବର୍ତ୍ତମାନ ଧାନ ମୂଲ୍ୟ ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍ ₹2100 ଏବଂ ବଢ଼ିବା ପ୍ରବଣତା ସହିତ।",
                        "କାନ୍ଦୁଲ ମୂଲ୍ୟ ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍ ₹6500 ରେ ମଜବୁତ ଅଛି। ବିକିବାର ଭଲ ସମୟ।",
                        "ବଜାର ମୂଲ୍ୟ ଜିଲ୍ଲା ଅନୁସାରେ ଭିନ୍ନ ଭିନ୍ନ ହୁଏ। ଆପଣ କେଉଁ ନିର୍ଦ୍ଦିଷ୍ଟ ଫସଲ ଏବଂ ସ୍ଥାନ ଚାହୁଁଛନ୍ତି?"
                    ],
                    "follow_up": [
                        "ଆପଣ କେଉଁ ଜିଲ୍ଲାର ମଣ୍ଡି ମୂଲ୍ୟ ଖୋଜୁଛନ୍ତି?",
                        "ଆପଣ କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଫସଲ ପାଇଁ ମୂଲ୍ୟ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆସନ୍ତା ମାସ ପାଇଁ ମୂଲ୍ୟ ପ୍ରବଣତା ବିଶ୍ଳେଷଣ ଚାହୁଁଛନ୍ତି କି?"
                    ]
                }
            },
            "general": {
                "en": {
                    "patterns": [
                        r"hello",
                        r"help",
                        r"what.*can.*do",
                        r"how.*use"
                    ],
                    "responses": [
                        "Hello! I'm KrishimitraAI, your farming assistant. I can help with weather, disease detection, market prices, and crop advice.",
                        "Welcome! I provide information on weather conditions, crop diseases, market prices, and farming best practices.",
                        "I'm here to help Odisha farmers with agricultural guidance. How can I assist you today?"
                    ],
                    "follow_up": [
                        "Would you like to check today's weather?",
                        "Do you need help with crop disease identification?",
                        "Are you looking for current market prices?"
                    ]
                },
                "or": {
                    "patterns": [
                        r"ନମସ୍କାର",
                        r"ସାହାଯ୍ୟ",
                        r"କଣ.*କରିପାରିବ",
                        r"କିଭଳି.*ବ୍ୟବହାର"
                    ],
                    "responses": [
                        "ନମସ୍କାର! ମୁଁ କୃଷିମିତ୍ରAI, ଆପଣଙ୍କର କୃଷି ସହାୟକ। ମୁଁ ଆବହାବା, ରୋଗ ଚିହ୍ନା, ବଜାର ମୂଲ୍ୟ, ଏବଂ ଫସଲ ପରାମର୍ଶରେ ସାହାଯ୍ୟ କରିପାରିବି।",
                        "ସ୍ୱାଗତ! ମୁଁ ଆବହାବା ଅବସ୍ଥା, ଫସଲ ରୋଗ, ବଜାର ମୂଲ୍ୟ, ଏବଂ ଚାଷ ଶ୍ରେଷ୍ଠ ଅଭ୍ୟାସ ଉପରେ ସୂଚନା ପ୍ରଦାନ କରେ।",
                        "ମୁଁ ଓଡିଶା ଚାଷୀମାନଙ୍କୁ କୃଷି ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରିବାକୁ ଏଠାରେ ଅଛି। ମୁଁ ଆପଣଙ୍କୁ କିଭଳି ସାହାଯ୍ୟ କରିପାରିବି?"
                    ],
                    "follow_up": [
                        "ଆପଣ ଆଜିର ଆବହାବା ଯାଞ୍ଚ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆପଣ ଫସଲ ରୋଗ ଚିହ୍ନାରେ ସାହାଯ୍ୟ ଚାହୁଁଛନ୍ତି କି?",
                        "ଆପଣ ବର୍ତ୍ତମାନ ବଜାର ମୂଲ୍ୟ ଖୋଜୁଛନ୍ତି କି?"
                    ]
                }
            }
        }
    
    def detect_language(self, text: str) -> Language:
        """Detect the language of the input text"""
        text_lower = text.lower()
        
        # Check for Odia characters first
        if any(char in text for char in ['ଅ', 'ଆ', 'ଇ', 'ଈ', 'ଉ', 'ଊ', 'ଋ', 'ଏ', 'ଐ', 'ଓ', 'ଔ']):
            return Language.ODIA
        
        # Check for Odia patterns
        for pattern in self.language_patterns:
            if pattern in text_lower and self.language_patterns[pattern] == Language.ODIA:
                return Language.ODIA
        
        # Default to English
        return Language.ENGLISH
    
    def categorize_query(self, text: str, language: Language) -> QueryCategory:
        """Categorize the user query"""
        text_lower = text.lower()
        
        for category, category_data in self.knowledge_base.items():
            lang_key = "en" if language == Language.ENGLISH else "or"
            patterns = category_data[lang_key]["patterns"]
            
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    if category == "weather":
                        return QueryCategory.WEATHER
                    elif category == "disease":
                        return QueryCategory.DISEASE
                    elif category == "market":
                        return QueryCategory.MARKET
        
        return QueryCategory.GENERAL
    
    def generate_response(self, text: str) -> ChatResponse:
        """Generate response for user query"""
        try:
            # Input validation
            if not text or not isinstance(text, str):
                text = str(text) if text else "hello"
            
            text = text.strip()
            if len(text) == 0:
                text = "hello"
            elif len(text) > 1000:
                text = text[:1000] + "..."  # Truncate very long messages
            
            language = self.detect_language(text)
            category = self.categorize_query(text, language)
            
            # Get category data
            category_map = {
                QueryCategory.WEATHER: "weather",
                QueryCategory.DISEASE: "disease",
                QueryCategory.MARKET: "market",
                QueryCategory.GENERAL: "general"
            }
            
            category_key = category_map[category]
            lang_key = "en" if language == Language.ENGLISH else "or"
            
            # Safe access to knowledge base
            if category_key not in self.knowledge_base or lang_key not in self.knowledge_base[category_key]:
                raise ValueError(f"Invalid category or language: {category_key}, {lang_key}")
            
            category_data = self.knowledge_base[category_key][lang_key]
            
            # Select response based on query content
            response_text = category_data["responses"][0] if category_data["responses"] else "I'm here to help with your farming questions."
            confidence = 0.8
            
            # Try to match specific patterns for better responses
            for i, pattern in enumerate(category_data["patterns"]):
                try:
                    if re.search(pattern, text.lower()):
                        response_text = category_data["responses"][min(i, len(category_data["responses"]) - 1)]
                        confidence = 0.9
                        break
                except re.error:
                    continue  # Skip invalid regex patterns
            
            # Get follow-up questions
            follow_up_questions = category_data.get("follow_up", [])
            
            # Validate response text
            if not response_text or not isinstance(response_text, str):
                response_text = "I'm here to help with your farming questions."
                confidence = 0.5
            
            response_text = response_text.strip()
            if len(response_text) == 0:
                response_text = "I'm here to help with your farming questions."
            
            # Validate confidence
            if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
                confidence = 0.5
            
            # Validate follow-up questions
            if not isinstance(follow_up_questions, list):
                follow_up_questions = []
            
            follow_up_questions = [q for q in follow_up_questions if isinstance(q, str) and len(q.strip()) > 0]
            if len(follow_up_questions) == 0:
                follow_up_questions = [
                    "Would you like to check today's weather?",
                    "Do you need help with crop disease identification?",
                    "Are you looking for current market prices?"
                ]
            
            # Add to conversation history
            self.conversation_history.append({
                "user_message": text,
                "bot_response": response_text,
                "language": language.value,
                "category": category.value,
                "timestamp": datetime.now().isoformat()
            })
            
            return ChatResponse(
                text=response_text,
                language=language,
                category=category,
                confidence=float(confidence),
                follow_up_questions=follow_up_questions[:3]  # Limit to 3 questions
            )
            
        except Exception as e:
            print(f"Critical error in generate_response: {e}")
            # Last resort fallback
            return ChatResponse(
                text="I'm experiencing some technical difficulties, but I'm here to help with farming questions.",
                language=Language.ENGLISH,
                category=QueryCategory.GENERAL,
                confidence=0.2,
                follow_up_questions=[
                    "Would you like to try asking again?",
                    "Do you need weather information?",
                    "Are you looking for crop advice?"
                ]
            )
    
    def get_conversation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []

class ChatbotAPI:
    def __init__(self):
        self.chatbot = BilingualChatbot()
        self.sessions = {}  # In production, use Redis or database
    
    def create_session(self, user_id: str) -> str:
        """Create a new chat session"""
        import uuid
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.now(),
            "chatbot": BilingualChatbot()
        }
        return session_id
    
    def send_message(self, session_id: str, message: str) -> Dict:
        """Send message and get response"""
        if session_id not in self.sessions:
            return {"error": "Invalid session"}
        
        chatbot = self.sessions[session_id]["chatbot"]
        response = chatbot.generate_response(message)
        
        return {
            "session_id": session_id,
            "response": {
                "text": response.text,
                "language": response.language.value,
                "category": response.category.value,
                "confidence": response.confidence,
                "follow_up_questions": response.follow_up_questions
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def get_session_history(self, session_id: str) -> Dict:
        """Get session conversation history"""
        if session_id not in self.sessions:
            return {"error": "Invalid session"}
        
        chatbot = self.sessions[session_id]["chatbot"]
        history = chatbot.get_conversation_history()
        
        return {
            "session_id": session_id,
            "history": history,
            "total_messages": len(history)
        }

def main():
    """Test the chatbot system"""
    chatbot = BilingualChatbot()
    
    print("=== Bilingual Chatbot Test ===")
    
    # Test English queries
    english_queries = [
        "What's the weather today?",
        "My rice plants have yellow leaves",
        "What's the current market price for rice?",
        "Hello, I need help with farming"
    ]
    
    print("\n--- English Queries ---")
    for query in english_queries:
        response = chatbot.generate_response(query)
        print(f"Q: {query}")
        print(f"A: {response.text}")
        print(f"Language: {response.language.value}, Category: {response.category.value}")
        print()
    
    # Test Odia queries
    odia_queries = [
        "ଆଜି ଆବହାବା କେମିତି ଅଛି?",
        "ମୋର ଧାନ ଗଛରେ ହଳଦିଆ ପତ୍ର ଅଛି",
        "ଧାନ ପାଇଁ ବର୍ତ୍ତମାନ ବଜାର ମୂଲ୍ୟ କେତେ?",
        "ନମସ୍କାର, ମୁଁ ଚାଷ ପାଇଁ ସାହାଯ୍ୟ ଚାହୁଁଛି"
    ]
    
    print("--- Odia Queries ---")
    for query in odia_queries:
        response = chatbot.generate_response(query)
        print(f"Q: {query}")
        print(f"A: {response.text}")
        print(f"Language: {response.language.value}, Category: {response.category.value}")
        print()

if __name__ == "__main__":
    main()
