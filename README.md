# AI Tour Guide - Product Requirements Document (PRD)

## 1. Introduction &amp; Vision

**AI Tour Guide** is a modern, AI-powered web application designed to transform any smartphone into a personal, intelligent tour guide. By simply pointing their camera at an artwork, monument, or landmark, users can receive rich, detailed descriptions and historical context in seconds.

The vision is to make art and history more accessible, engaging, and informative for everyone—from casual tourists and museum-goers to students and curious explorers. This application eliminates the need for expensive audio guides or sifting through search results, providing instant, curated knowledge directly in the user's hand.

## 2. Core Features

### 2.1. Real-time Camera Identification
- **Description:** The primary user interface is a live camera view. Users can point their device at an object of interest and capture a photo with a single tap.
- **User Story:** "As a tourist, I want to quickly take a picture of a statue I don't recognize so I can learn about it."
- **Requirements:**
    - The application must request and obtain permission to use the device's camera.
    - It should default to the rear-facing camera (`environment`).
    - A clear, accessible capture button must be present.

### 2.2. AI-Powered Analysis &amp; Description
- **Description:** Upon capturing an image, it is sent to the Google Gemini API for analysis. The AI identifies the object and generates a structured, comprehensive description.
- **User Story:** "As a museum visitor, I want to get more than just the title from the plaque; I want to understand the artist's background, the story behind the piece, and a fun fact about it."
- **Requirements:**
    - The app will use the `gemini-2.5-flash` model for its powerful and fast vision capabilities.
    - A system prompt guides the AI to return information in a specific format:
        - **Title of the item**
        - **Artist name and background**
        - **Date of production**
        - **Item description with historical background**
        - **Anecdote:** A special, interesting fact about the item.
    - The app must display clear loading messages while the analysis is in progress.
    - Robust error handling must be in place for API failures, network issues, or unidentifiable images.

### 2.3. Text-to-Speech Narration
- **Description:** Users can listen to the generated description, allowing for a hands-free, immersive experience.
- **User Story:** "As a user, I want to listen to the description while I continue looking at the artwork, without having to read from my screen."
- **Requirements:**
    - Standard audio controls: Play and Pause.
    - A vertical volume slider for adjusting audio levels in real-time.
    - The app utilizes the browser's native `SpeechSynthesis` API.
    - Playback automatically stops if the user navigates away or requests a new analysis.

### 2.4. Capture History
- **Description:** Every captured image and its corresponding analysis (successful or not) is saved locally to the device. This allows users to revisit their discoveries.
- **User Story:** "As a student, I want to review all the artworks I scanned during my museum visit later to study them."
- **Requirements:**
    - History is accessible via a slide-out sidebar.
    - The history view displays a grid of image thumbnails.
    - Selecting an item from the history displays its saved image and description.
    - If an initial analysis failed (e.g., due to a network error), the user can tap the thumbnail to retry the analysis.
    - History is persisted using `localStorage`, capped at the most recent 100 items.

### 2.5. Interactive UI/UX
- **Description:** The application is designed to be intuitive, responsive, and visually appealing, with a focus on a mobile-first experience.
- **Requirements:**
    - **Image Zoom:** Users can tap the captured image to view a full-screen, high-resolution version.
    - **Sharing:** A share button allows users to send the text description via native device sharing or copy it to the clipboard.
    - **Responsive Design:** The layout adapts gracefully to different screen sizes.
    - **Loading States:** Animated spinners and rotating messages keep the user engaged during processing.

## 3. Technical Overview

- **Frontend Framework:** React with TypeScript
- **Styling:** TailwindCSS
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`) via the `@google/genai` SDK.
- **Local Storage:** Browser `localStorage` API for history persistence.
- **Speech Synthesis:** Browser `SpeechSynthesis` API.
- **Permissions:** The app requests camera permissions via the `navigator.mediaDevices.getUserMedia` API.

## 4. Future Enhancements

- **Multi-language Support:** Allow users to select their preferred language for both the UI and the AI-generated content.
- **Location-Aware Suggestions:** Use device GPS to suggest nearby points of interest for analysis.
- **Batch Analysis:** Allow users to select multiple photos from their gallery for analysis.
- **Augmented Reality (AR) Overlays:** Display key information as an overlay directly on the live camera feed.
- **User Accounts:** Introduce user accounts to sync history across multiple devices.
