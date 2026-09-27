# Vendor Dashboard API Documentation

This document defines the backend APIs for the **Vendor Dashboard** screen on the jewellery marketplace application.

---

## Authentication & Authorization

* All endpoints require an **authenticated Vendor account**.
* Pass the JWT access token in the `Authorization` header:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```
* The vendor ID is automatically resolved from the authenticated session (no manual `vendorId` parameter is required).
* Non-vendor accounts will receive HTTP `403 Forbidden` (`VENDOR_ONLY`).

---

# 1. Dashboard Analytics Summary

Returns the high-level summary metrics for the authenticated vendor's store.

### Endpoint
`GET /api/vendor/dashboard/analytics`

### Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_ACCESS_TOKEN>` | Yes |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Dashboard analytics fetched successfully",
  "data": {
    "totalStoreViews": 1420,
    "totalEnquiries": 85,
    "totalRatings": 42,
    "totalProductsListed": 15
  }
}
```

---

# 2. Store Views Graph

Returns store-view analytics with zero-filled, ordered time coordinates ready for Flutter chart plotting (e.g., `fl_chart`).

### Endpoint
`GET /api/vendor/dashboard/views-graph`

### Query Parameters
| Parameter | Type | Required | Default | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `period` | String | No | `week` | `day`, `week`, `month`, `year` | Time aggregation interval |

### Filter Behaviour
* **`day`**: 24 hourly buckets (`00:00`, `01:00`, ..., `23:00`).
* **`week`**: Last 7 days (`Mon` through `Sun`).
* **`month`**: Days of current month (`1` through `30/31`).
* **`year`**: 12 months (`Jan` through `Dec`).

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Views graph data fetched successfully",
  "data": {
    "period": "week",
    "total": 128,
    "points": [
      { "label": "Mon", "date": "2026-09-21", "count": 14 },
      { "label": "Tue", "date": "2026-09-22", "count": 22 },
      { "label": "Wed", "date": "2026-09-23", "count": 18 },
      { "label": "Thu", "date": "2026-09-24", "count": 25 },
      { "label": "Fri", "date": "2026-09-25", "count": 30 },
      { "label": "Sat", "date": "2026-09-26", "count": 12 },
      { "label": "Sun", "date": "2026-09-27", "count": 7 }
    ]
  }
}
```

---

# 3. Enquiries Graph

Returns enquiry counts according to the selected time period for graph plotting.

### Endpoint
`GET /api/vendor/dashboard/enquiries-graph`

### Query Parameters
| Parameter | Type | Required | Default | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `period` | String | No | `week` | `day`, `week`, `month`, `year` | Time aggregation interval |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Enquiries graph data fetched successfully",
  "data": {
    "period": "day",
    "total": 19,
    "points": [
      { "label": "00:00", "count": 0 },
      { "label": "01:00", "count": 0 },
      { "label": "10:00", "count": 4 },
      { "label": "11:00", "count": 6 },
      { "label": "14:00", "count": 9 },
      { "label": "23:00", "count": 0 }
    ]
  }
}
```

---

# 4. Customer Enquiry List

Returns a paginated list of customer enquiries received by the vendor, with the latest enquiries first.

### Endpoint
`GET /api/vendor/dashboard/enquiries`

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | No | `1` | Page number (min 1) |
| `limit` | Integer | No | `10` | Records per page (min 1, max 100) |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "enquiryId": "ENQ100001",
        "message": "Is this necklace available in 22K yellow gold?",
        "customer": {
          "name": "Pooja Verma",
          "mobileNumber": "9876543210",
          "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg"
        },
        "product": {
          "id": "item-uuid-1",
          "title": "Kundan Choker Necklace",
          "imageUrl": "https://s3.amazonaws.com/bucket/necklace.jpg",
          "price": "45000.00"
        },
        "date": "2026-09-27",
        "time": "14:30:00",
        "createdAt": "2026-09-27T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 85,
      "totalPages": 9
    }
  }
}
```

---

# 5. Ratings & Reviews List

Returns a paginated list of ratings and customer reviews received by the vendor (latest first).

### Endpoint
`GET /api/vendor/dashboard/ratings`

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | No | `1` | Page number (min 1) |
| `limit` | Integer | No | `10` | Records per page (min 1, max 100) |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Ratings fetched successfully",
  "data": {
    "ratings": [
      {
        "id": "rating-uuid-1",
        "rating": 5,
        "review": "Exceptional craftsmanship! The finish and packaging were truly luxurious.",
        "customerName": "Yogesh Soni",
        "customerProfileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
        "date": "2026-09-27",
        "time": "15:00:00",
        "createdAt": "2026-09-27T15:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 42,
      "totalPages": 5
    }
  }
}
```

---

# 6. Overall Rating Summary

Returns the vendor's overall rating, average score, and star distribution breakdown.

### Endpoint
`GET /api/vendor/dashboard/rating-summary`

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Rating summary fetched successfully",
  "data": {
    "totalRatings": 42,
    "averageRating": 4.6,
    "distribution": {
      "5": { "count": 28, "percentage": 66.7 },
      "4": { "count": 10, "percentage": 23.8 },
      "3": { "count": 3, "percentage": 7.1 },
      "2": { "count": 1, "percentage": 2.4 },
      "1": { "count": 0, "percentage": 0.0 }
    }
  }
}
```

---

# API Summary

| Feature | Method | Endpoint | Query Params |
| :--- | :--- | :--- | :--- |
| **Analytics Summary** | `GET` | `/api/vendor/dashboard/analytics` | None |
| **Store Views Graph** | `GET` | `/api/vendor/dashboard/views-graph` | `period=day\|week\|month\|year` |
| **Enquiries Graph** | `GET` | `/api/vendor/dashboard/enquiries-graph` | `period=day\|week\|month\|year` |
| **Customer Enquiries** | `GET` | `/api/vendor/dashboard/enquiries` | `page=1&limit=10` |
| **Ratings & Reviews** | `GET` | `/api/vendor/dashboard/ratings` | `page=1&limit=10` |
| **Rating Summary** | `GET` | `/api/vendor/dashboard/rating-summary` | None |
