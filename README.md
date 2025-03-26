# Chatbot Project

## Overview
This project is a customer support chatbot designed for online shopping assistance. It utilizes a language model to answer user queries, provide product recommendations, and enhance the shopping experience.

## Features
- Natural language processing for understanding customer inquiries.
- Predefined responses stored in `knowledge_base.json`.
- Interactive frontend using HTML, CSS, and JavaScript.
- Backend built with Python (Flask or Streamlit).
- Easily customizable knowledge base.

## Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd chatbot_project
   ```
2. Create a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Usage
1. Run the chatbot application:
   ```sh
   python app.py
   ```
2. Open a browser and go to `http://127.0.0.1:5000/`.
3. Start interacting with the chatbot.

## Project Structure
```
chatbot_project/
│── app.py                 # Main application script
│── knowledge_base.json    # Store chatbot responses
│── requirements.txt       # Dependencies
│
├── static/
│   ├── css/
│   │   └── styles.css    # Stylesheets
│   ├── js/
│   │   └── script.js     # Frontend scripts
│
├── templates/
│   └── index.html        # HTML template
```

## Future Improvements
- Integration with an LLM API.
- Advanced NLP techniques for better responses.
- Database storage for user interactions.

## License
This project is licensed under the MIT License.

