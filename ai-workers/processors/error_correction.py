"""Error Correction and Quality Improvement"""
from typing import List, Dict, Any, Optional, Tuple
import re
from difflib import SequenceMatcher
import structlog

logger = structlog.get_logger()


class ErrorCorrector:
    """Corrects common OCR errors and improves text quality"""
    
    def __init__(self):
        # Common OCR substitution errors
        self.substitutions = {
            '0': ['O', 'o', 'Q'],
            '1': ['l', 'I', 'i', '|'],
            '5': ['S', 's'],
            '6': ['G', 'b'],
            '8': ['B'],
            '2': ['Z', 'z'],
            'O': ['0', 'Q'],
            'l': ['1', 'I', '|'],
            'rn': ['m'],
            'vv': ['w'],
            'cl': ['d'],
            'cI': ['d'],
        }
        
        # Common word corrections
        self.word_corrections = {
            'teh': 'the',
            'adn': 'and',
            'fo': 'of',
            'ot': 'to',
            'taht': 'that',
            'wiht': 'with',
            'fro': 'for',
            'jsut': 'just',
            'nto': 'not',
            'hte': 'the',
        }
        
        # Domain-specific dictionaries (can be extended)
        self.domain_words = set([
            'invoice', 'receipt', 'total', 'subtotal', 'tax', 'amount',
            'date', 'number', 'quantity', 'price', 'description', 'unit',
            'customer', 'vendor', 'address', 'phone', 'email', 'payment',
            'due', 'balance', 'paid', 'discount', 'shipping', 'handling',
        ])
    
    def correct(
        self,
        text: str,
        context: Optional[str] = None,
        domain: Optional[str] = None,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """Correct text and return corrections made"""
        corrections = []
        
        # Split into words
        words = text.split()
        corrected_words = []
        
        for word in words:
            # Preserve punctuation
            prefix = ""
            suffix = ""
            
            while word and not word[0].isalnum():
                prefix += word[0]
                word = word[1:]
            
            while word and not word[-1].isalnum():
                suffix = word[-1] + suffix
                word = word[:-1]
            
            if not word:
                corrected_words.append(prefix + suffix)
                continue
            
            # Try to correct the word
            corrected, correction_type = self._correct_word(word, context)
            
            if corrected != word:
                corrections.append({
                    "original": word,
                    "corrected": corrected,
                    "type": correction_type,
                })
            
            corrected_words.append(prefix + corrected + suffix)
        
        corrected_text = " ".join(corrected_words)
        
        # Fix spacing issues
        corrected_text = self._fix_spacing(corrected_text)
        
        logger.info("Error correction complete", num_corrections=len(corrections))
        
        return corrected_text, corrections
    
    def _correct_word(
        self,
        word: str,
        context: Optional[str],
    ) -> Tuple[str, str]:
        """Correct a single word"""
        lower_word = word.lower()
        
        # Check direct corrections
        if lower_word in self.word_corrections:
            corrected = self.word_corrections[lower_word]
            # Preserve case
            if word.isupper():
                corrected = corrected.upper()
            elif word[0].isupper():
                corrected = corrected.capitalize()
            return corrected, "word_correction"
        
        # Check if it's a valid domain word
        if lower_word in self.domain_words:
            return word, "no_correction"
        
        # Try character substitution corrections
        if self._looks_like_number(word):
            corrected = self._correct_number(word)
            if corrected != word:
                return corrected, "number_correction"
        
        # Try to match against domain words
        best_match = self._find_best_match(lower_word, self.domain_words)
        if best_match and best_match[1] > 0.8:
            corrected = best_match[0]
            if word.isupper():
                corrected = corrected.upper()
            elif word[0].isupper():
                corrected = corrected.capitalize()
            return corrected, "domain_match"
        
        return word, "no_correction"
    
    def _looks_like_number(self, text: str) -> bool:
        """Check if text looks like a number (possibly with OCR errors)"""
        # Remove common number-like characters
        cleaned = re.sub(r'[0-9OoIl|.,\-$%]', '', text)
        return len(cleaned) <= len(text) * 0.3
    
    def _correct_number(self, text: str) -> str:
        """Correct OCR errors in numbers"""
        corrections = {
            'O': '0', 'o': '0',
            'I': '1', 'l': '1', '|': '1',
            'S': '5', 's': '5',
            'B': '8',
            'Z': '2', 'z': '2',
        }
        
        result = ""
        for char in text:
            if char in corrections and not char.isdigit():
                result += corrections[char]
            else:
                result += char
        
        return result
    
    def _find_best_match(
        self,
        word: str,
        dictionary: set,
        threshold: float = 0.8,
    ) -> Optional[Tuple[str, float]]:
        """Find the best matching word in a dictionary"""
        best_match = None
        best_score = threshold
        
        for dict_word in dictionary:
            # Skip if length difference is too large
            if abs(len(word) - len(dict_word)) > 2:
                continue
            
            score = SequenceMatcher(None, word, dict_word).ratio()
            
            if score > best_score:
                best_score = score
                best_match = dict_word
        
        return (best_match, best_score) if best_match else None
    
    def _fix_spacing(self, text: str) -> str:
        """Fix common spacing issues"""
        # Remove multiple spaces
        text = re.sub(r' +', ' ', text)
        
        # Fix space before punctuation
        text = re.sub(r' ([.,;:!?])', r'\1', text)
        
        # Add space after punctuation if missing
        text = re.sub(r'([.,;:!?])([A-Za-z])', r'\1 \2', text)
        
        # Fix spacing around currency
        text = re.sub(r'\$ +', '$', text)
        text = re.sub(r'(\d) +%', r'\1%', text)
        
        return text.strip()
    
    def validate_numbers(
        self,
        text: str,
        expected_format: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Validate numbers in text"""
        issues = []
        
        # Find all number-like patterns
        number_pattern = r'[\$£€]?\s*[\d,]+\.?\d*\s*%?'
        matches = re.finditer(number_pattern, text)
        
        for match in matches:
            value = match.group().strip()
            
            # Check for common issues
            if re.search(r'\d,\d{1,2}(?!\d)', value):
                # Comma not followed by 3 digits (except at end)
                issues.append({
                    "value": value,
                    "position": match.start(),
                    "issue": "suspicious_comma_placement",
                })
            
            if value.count('.') > 1:
                issues.append({
                    "value": value,
                    "position": match.start(),
                    "issue": "multiple_decimal_points",
                })
        
        return issues


# Singleton instance
error_corrector = ErrorCorrector()
