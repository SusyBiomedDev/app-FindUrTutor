# FindUrTutor 🎓

A mobile app that helps students find the right PhD supervisor, based on real scientific publications from PubMed. It can also be used by scientists looking for collaborators or by biotech startups looking for experts in a specific field.

Built with **React Native + TypeScript**.

---

## ✨ Features

- Search PubMed scientific articles by keyword
- View supervisors/researchers as cards
- View supervisors/researchers on a map (geolocation)
- Save favourite articles and supervisors (AsyncStorage)
- Settings screen and app information

---

## 📱 Screenshots

| Home | Map |
|------|-----|
| ![Home](https://github.com/user-attachments/assets/30e62010-91dd-4022-af3c-2430ba6dc61d) | ![Map](https://github.com/user-attachments/assets/c0a25658-af9a-4a91-9a67-ee3569e6bf31) |

---

## ⚙️ How it works

1. The user searches for an area of interest (e.g. *rituximab*).
2. The app retrieves the relevant articles.
3. Researchers are identified from the authors and their affiliations.
4. Affiliations are converted into coordinates and displayed on the map.

---

## 🛠️ Tech stack

- React Native
- TypeScript
- PubMed E-utilities API (NCBI)
- React Navigation
- React Native Maps
- AsyncStorage

---

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 22.11
- JDK 17
- Android Studio (with Android SDK and an emulator configured) or a physical device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SusyBiomedDev/app-FindUrTutor.git
cd app-FindUrTutor

# 2. Install dependencies
npm install

# 3. Start Metro
npm start

# 4. Run on Android (in another terminal)
npm run android
```

---

## ⚠️ Limitations

- The NCBI API allows up to 3 requests per second without an API key.

---

## 👩‍💻 Authors

Developed by [SusyBiomedDev](https://github.com/SusyBiomedDev) and Uriel Cabita ([Uri-Bee](https://github.com/Uri-Bee)).

## 📄 License

This project is licensed under the MIT License.
