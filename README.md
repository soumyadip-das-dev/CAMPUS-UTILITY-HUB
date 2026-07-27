# Campus Utility Hub

A comprehensive web-based utility application designed for students to manage various academic and personal tasks efficiently.

## Features

### 📚 Academic Tools
- **Smart Attendance Tracker** - Track student attendance with Present, Absent, and Late statuses. View attendance percentages.
- **CGPA Calculator** - Calculate your CGPA by adding subjects with grades (O, A+, A, B+, B, C) and credit values.

### 🔧 Utility Tools
- **Binary & Number Converter** - Convert decimal numbers to binary and other formats.
- **Password Strength Analyzer** - Analyze password strength with real-time feedback through a visual meter.
- **Number Converter** - Convert between different number systems.

### 📝 Learning & Assessment
- **Dynamic Quiz System** - Test your knowledge with an interactive quiz system that tracks your score.
- **Typing Speed Tester** - Measure your typing speed and accuracy.

### 💰 Finance Tools
- **Expense Splitter** - Easily split and track expenses among friends or roommates.

### 🎨 Customization
- **Theme Generator** - Customize your experience with:
  - Background color selection
  - Font size adjustment (14-25px)
  - Card border radius customization (5-40px)
  - Spacing adjustment (10-40px)
  - Dark mode toggle

## Project Structure

```
CAMPUS UTILITY HUB/
├── index.html          # Main HTML file with all tool sections
├── script.js           # Main JavaScript file
├── style.css           # Styling and themes
├── data/
│   └── questions.js    # Quiz questions database
└── modules/
    ├── attendance.js   # Attendance tracking functionality
    ├── cgpa.js         # CGPA calculator logic
    ├── expense.js      # Expense splitter logic
    ├── numberconverter.js  # Number conversion utilities
    ├── password.js     # Password analysis functionality
    ├── quiz.js         # Quiz system implementation
    ├── theme.js        # Theme customization logic
    └── typing.js       # Typing tester functionality
```

## Getting Started

### Installation
1. Clone or download the project
2. Navigate to the project directory
3. Open `index.html` in your web browser

### Usage
1. **Sidebar Navigation** - Click on any tool in the sidebar to access different utilities
2. **Dark Mode** - Click "Toggle Dark Mode" button to switch between light and dark themes
3. **Theme Customization** - Use the Theme Generator to personalize your interface

## Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling, flexbox, and responsive design
- **JavaScript (ES6+)** - Core functionality and interactivity
- **Local Storage** - Data persistence across sessions

## Features Breakdown

### Attendance Tracker
- Add student records with attendance status
- Automatic calculation of attendance percentage
- Display records in a table format

### CGPA Calculator
- Add multiple subjects with credits and grades
- Automatic CGPA calculation based on weighted grades
- Support for all standard grade points (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5)

### Password Analyzer
- Real-time password strength evaluation
- Visual strength meter
- Feedback based on password criteria

### Quiz System
- Multiple choice questions
- Score tracking
- Dynamic question presentation

### Expense Splitter
- Add expenses with person names and amounts
- Track who paid what
- Easy expense management

### Typing Tester
- Measure typing speed (WPM)
- Accuracy calculation
- Real-time feedback

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips for Best Experience
- Enable JavaScript for full functionality
- Use a modern browser for optimal performance
- Bookmark the page for easy access
- Your data is stored locally in your browser

## License
This project is created for educational purposes.

## Contributing
Feel free to suggest improvements or report bugs!
