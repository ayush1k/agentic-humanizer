#!/bin/bash
cd /workspaces/humanizer
git add -A ':(exclude)clawwd'
git commit -m "feat: Add error handling, logging, and enhanced text processing

- Added ValidationError, ProcessingError, NetworkError classes
- Implemented structured Logger with multiple log levels
- Added patterns.ts with style-specific replacement patterns
- Added readability.ts with Flesch-Kincaid metrics
- Enhanced gui.ts with better error handling and UX improvements
- Updated humanize.ts with new styles and error handling
- Added comprehensive logging throughout index.ts
- Support for new styles: professional, technical, creative
- Added timeout handling for API requests
- Improved client-side UI with status indicators and better feedback"
git push origin main
