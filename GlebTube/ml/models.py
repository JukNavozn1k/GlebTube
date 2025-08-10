from transformers import AutoTokenizer, AutoModel
try:
    tokenizer = AutoTokenizer.from_pretrained("ml/models/tokenizer")
    model = AutoModel.from_pretrained("ml/models/encoder")
except:
    tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2")
    model = AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2")
    tokenizer.save_pretrained("ml/models/tokenizer")
    model.save_pretrained("ml/models/encoder")