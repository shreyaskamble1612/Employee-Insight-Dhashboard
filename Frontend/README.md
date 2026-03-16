# Employee Insights Dashboard

## Run

```bash
npm install
npm run dev
```

Login credentials:

- Username: `testuser`
- Password: `Test123`

## Screens

1. Login
2. List with custom virtualization
3. Details with camera capture, signature overlay, and photo/signature merge
4. Analytics with merged audit image, SVG salary chart, and Leaflet map

## Architecture

- `AuthContext` persists the signed-in session in `localStorage` and protects routes.
- `EmployeeContext` owns employee API loading, normalized employee records, and merged audit-image state.
- `VirtualizedTable` uses custom scroll math from `UseVirtualization.js`; no UI virtualization library is used.
- `mergeImage.js` merges the captured photo and transparent signature layer into one PNG and also returns a Blob for audit metadata.


## Geospatial Mapping

The map uses Leaflet (`react-leaflet`) in `src/Components/CityMap.jsx`.

City-to-coordinate mapping is handled dynamically with OpenStreetMap Nominatim:

1. Extract unique city names from the `employees` dataset.
2. On `employees` changes, geocode each city with:
	`https://nominatim.openstreetmap.org/search?city=<CITY>&format=json&limit=1`
3. Read `lat`/`lon` from the first result and store them in React state.
4. Render one Leaflet marker per unique city and show the city name in a popup.

To avoid duplicate geocoding calls, the component keeps an in-memory cache (`useRef(new Map())`) keyed by city name.
Leaflet CSS is imported in the component to ensure map tiles and markers render correctly.

## Intentional Vulnerability

This submission intentionally contains exactly one bug to satisfy the assignment requirement.

- Bug type: memory leak
- Location: `src/Components/CameraCapture.jsx`
- Description: if the details page unmounts while the camera stream is still active and the user has not clicked `Stop Camera` or `Capture Photo`, the stream is not stopped automatically. This leaves the media track alive longer than necessary.

No other intentional performance or logic bugs were added.

## Notes

- Employee data falls back to a local dataset if the remote API is unavailable.
- Audit images are stored in `localStorage` so the analytics page can display the latest merged result after navigation.
- The assignment also asks for regular commits. I did not create git commits automatically in the workspace.
