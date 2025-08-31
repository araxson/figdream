# Heart Icon Detection and Click Script

This Python script automatically finds heart icons on your screen and double-clicks on them, repeating the process 10 times with 5-second intervals.

## Features

- **Smart Icon Detection**: Uses image recognition to find heart icons
- **Automatic Scrolling**: Scrolls down if the heart icon isn't visible
- **Precise Clicking**: Double-clicks exactly on the heart icon
- **Safety Features**: 3-second delay before starting, failsafe controls
- **Progress Tracking**: Shows which iteration is currently running

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Prepare a heart icon image:**
   - Take a screenshot of the heart icon you want to detect
   - Save it as one of these names in the same directory:
     - `heart.png`
     - `heart-icon.png`
     - `like-heart.png`
     - `heart-outline.png`
     - `heart-white.png`

## How to Capture the Heart Icon

1. **Take a screenshot** of just the heart icon (not the entire button)
2. **Make it clear and visible** - avoid blurry or partial images
3. **Include some surrounding area** if needed for better recognition
4. **Save as PNG format** for best results

## Usage

1. **Make sure the heart icon is visible** on your screen
2. **Run the script:**
   ```bash
   python scroll_and_click.py
   ```
3. **Wait 3 seconds** for the script to start
4. **Move mouse to top-left corner** to stop the script (failsafe)

## What It Does

1. Searches for the heart icon on screen
2. If found, double-clicks on it
3. If not found, scrolls down and searches again
4. Repeats 10 times with 5-second intervals
5. Shows progress and status for each iteration

## Troubleshooting

- **Icon not found**: Make sure the heart icon image is clear and matches what's on screen
- **Poor recognition**: Try adjusting the confidence level in the code (currently 0.8)
- **Wrong clicks**: Ensure the heart icon image only shows the heart, not surrounding elements

## Safety

- **FAILSAFE**: Move mouse to top-left corner to stop immediately
- **3-second delay** before starting
- **Progress tracking** so you know what's happening
- **Error handling** for graceful failures
