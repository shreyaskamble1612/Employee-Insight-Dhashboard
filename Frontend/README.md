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

### Intentional Vulnerability ###

This submission intentionally contains exactly one bug to satisfy the assignment requirement.

## What is the Bug?

This project intentionally includes a resource/memory leak related to the browser camera stream.
If the user navigates away from the Details page while the camera is still active, the camera media stream is not automatically stopped.

This means the video stream continues running longer than necessary, which can cause unnecessary resource usage.

## Where is Bug?
The issue is located in =>  src/components/CameraCapture.jsx
    Specifically, the component starts a camera stream using:
    navigator.mediaDevices.getUserMedia()

However, the stream is only stopped when the user clicks:

    `Stop Camera`

    Capture Photo

`If the user navigates away from the page before doing this, the component unmounts without cleaning up the active media tracks.`

## Why Was This Bug Chosen?
This bug was intentionally included because the assignment evaluates understanding of browser hardware APIs and React lifecycle management.

Working with navigator.mediaDevices.getUserMedia() requires proper cleanup of media tracks when components unmount.
Failing to release these resources can lead to memory leaks or unnecessary hardware usage.

By intentionally leaving out the cleanup logic, this demonstrates awareness of a common real-world issue developers encounter when integrating browser hardware APIs.




## Virtualization Math (Technical)

Custom virtualization is implemented in `src/hooks/UseVirtualization.js` and consumed by `src/Components/VirtualizedTable.jsx`.

Given:

- `N` = total rows (`data.length`)
- `H_row` = fixed row height (`rowHeight`)
- `H_view` = scroll container height (`containerHeight` / `height`)
- `S` = current scroll offset (`scrollTop`)
- `B` = overscan rows (`overscan`, default `6`)

The calculations are:

1. Visible rows in viewport
	`visibleRows = ceil(H_view / H_row)`

2. Start index (with top overscan)
	`startIndex = max(0, floor(S / H_row) - B)`

3. End index (with bottom overscan)
	`endIndex = min(N, startIndex + visibleRows + 2B)`

4. Slice to render
	`visibleData = data.slice(startIndex, endIndex)`

5. Total virtual content height
	`totalHeight = N * H_row`

6. Y-offset for rendered window
	`offsetY = startIndex * H_row`

DOM strategy:

- Outer scroll container has fixed height (`H_view`) and captures `scrollTop`.
- Inner spacer div has full virtual height (`totalHeight`) to preserve scrollbar behavior.
- Actual rendered rows are translated by `translateY(offsetY)` so they appear at the correct scroll position.

Complexity benefits:

- Without virtualization: render cost is `O(N)` rows.
- With virtualization: render cost is `O(visibleRows + 2B)`, effectively constant relative to dataset size.

## Notes

- Employee data falls back to a local dataset if the remote API is unavailable.
- Audit images are stored in `localStorage` so the analytics page can display the latest merged result after navigation.
- The assignment also asks for regular commits. I did not create git commits automatically in the workspace.
