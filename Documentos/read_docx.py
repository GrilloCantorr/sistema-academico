import docx
import sys

def read_docx(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        with open("eval_criteria.txt", "w", encoding="utf-8") as f:
            f.write('\n'.join(full_text))
            
        print("Done writing to eval_criteria.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    file_path = "EvalFinal (1).docx"
    read_docx(file_path)
