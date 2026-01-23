import re

class MessageUtil:
  def isBankSms(self, message):
    words_to_seacrh = ['bank', 'account', 'transaction', 'withdrawal', 'deposit', 'balance', 'statement']
    pattern = r'\b(?:' + '|'.join(re.escape(word) for word in words_to_seacrh) + r')\b'
    return re.search(pattern, message, flags = re.IGNORECASE) is not None 