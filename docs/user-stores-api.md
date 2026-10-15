# User Stores & Favorites API Documentation

This document defines the buyer-facing backend APIs for Discovering Stores, Viewing Store Details, and Marking Stores as Favorite / Unfavorite.

---

## Base Path
All endpoints are mounted under `/api/user/stores`.

---

# 1. Toggle Favorite Store (Favorite / Unfavorite)

Adds or removes a jewellery store from the current logged-in customer's favorites.

### Endpoint
`POST /api/user/stores/:storeId/favorite`

### Authentication
* **Required**: Yes (`USER` token)
* **Header**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### URL Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `storeId` | String | Store UUID or public vendor ID (e.g. `VND100001`) |

### Request Body
None

### Responses

#### Added to Favorites (`200 OK`)
```json
{
  "success": true,
  "message": "Store added to favorites",
  "data": {
    "isFavorite": true,
    "message": "Store added to favorites"
  }
}
```

#### Removed from Favorites (`200 OK`)
```json
{
  "success": true,
  "message": "Store removed from favorites",
  "data": {
    "isFavorite": false,
    "message": "Store removed from favorites"
  }
}
```

---

# 2. Get User Favorite Stores

Retrieves the list of stores favorited by the logged-in customer, including distance calculation and ratings.

### Endpoint
`GET /api/user/stores/favorites`

### Authentication
* **Required**: Yes (`USER` token)
* **Header**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `latitude` | Number | No | auto | Current user latitude (auto-fetched from user profile if omitted) |
| `longitude` | Number | No | auto | Current user longitude (auto-fetched from user profile if omitted) |
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `10` | Number of stores per page (max 50) |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Favorite stores fetched successfully",
  "data": {
    "items": [
      {
        "id": "2b30e052-aee7-42f0-93cb-5ce82d8c9f5e",
        "userId": "VND100001",
        "storeName": "Soni Jewellers",
        "storeDescription": "Handcrafted luxury jewellery",
        "storeLogo": "https://s3.amazonaws.com/.../logo.jpg",
        "storeCoverImage": "https://s3.amazonaws.com/.../cover-1.jpg",
        "location": {
          "addressLine1": "123 Gold St",
          "area": "Karol Bagh",
          "city": "New Delhi",
          "state": "Delhi",
          "pincode": "110005"
        },
        "distanceKm": 2.4,
        "averageRating": 4.8,
        "totalReviews": 28,
        "jewelleryStartingPrice": 1500,
        "isOpen": true,
        "isFavorite": true,
        "storeOpeningTime": "10:00",
        "storeClosingTime": "20:30",
        "favoritedAt": "2026-10-16T01:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

# 3. Discover Stores (with Favorite Status)

When discovering stores, each store item now includes `isFavorite: boolean` indicating whether the logged-in user has favorited it.

### Endpoint
`GET /api/user/stores`

### Authentication
* **Optional**: If provided, returns `isFavorite: true/false` and auto-calculates distance from user profile location. If unauthenticated, `isFavorite` defaults to `false`.

---

# 4. Store Details (with Favorite Status)

Fetches full store profile and now includes `isFavorite: boolean`.

### Endpoint
`GET /api/user/stores/:storeId`

### Authentication
* **Optional**: If provided, checks if the store is in user's favorites and auto-registers a store view.
