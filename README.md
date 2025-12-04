code-pattern-detector 

An intelligent code analysis and pattern detection tool built using HTML, CSS, and JavaScript.
It analyzes source code pasted by the user and identifies common programming patterns such as loops, recursion, and potential infinite loops, while also estimating time complexity and detecting the programming language.

All analysis runs completely client-side.

Live Demo: https://nitingupta05.github.io/code-pattern-detector/

Features

- Paste code in the editor and analyze instantly
- Automatic programming language detection (C, C++, Java, Python, JavaScript)
- Detects common patterns:
- Loop patterns (for, while, do-while)
- Nested loops
- Recursion detection
- Infinite loop detection (e.g. while(true))
- Time-complexity estimation:

Code safety hints:
- Infinite loop warnings
 -Missing loop breaks
- Recursive base condition checks
- User interaction:
- Analyze result shown only after Analyze Code is clicked
- Shake animation on detected errors / infinite loops
- Copy result as text button (useful for notes or teaching)
- Clean dark / light theme

Tech Stack

- HTML5 – structure
- CSS3 – styling, animations, dark/light theme
- Vanilla JavaScript (ES6) – analysis logic & pattern matching

No frameworks or external libraries.

Folder Structure
code-pattern-detector/
├── index.html        # Main analyzer UI
├── style.css         # Styling & themes
└── script.js         # Pattern detection logic

Author
- Nitin Gupta
- GitHub: https://github.com/NitinGupta05
