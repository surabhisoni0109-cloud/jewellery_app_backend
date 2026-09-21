# User & Vendor Authentication API Documentation

## 1. Overview

This document defines the APIs required for **User and Vendor registration and login** using mobile number OTP verification.

### Supported User Types

* `user`
* `vendor`

---

# 2. Signup / Registration

The signup process consists of two steps:

1. Submit registration details.
2. Verify the OTP sent to the registered mobile number.

## 2.1 Signup Request

### Endpoint

`POST /api/auth/signup`

### Request Body

```json
{
  "type": "user",
  "firstName": "Yogesh",
  "lastName": "Kumawat",
  "mobileNumber": "9876543210",
  "email": "yogesh@example.com"
}
```

### Parameters

| Parameter      | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| `type`         | String | Yes      | Account type: `user` or `vendor` |
| `firstName`    | String | Yes      | User's first name                |
| `lastName`     | String | Yes      | User's last name                 |
| `mobileNumber` | String | Yes      | Registered mobile number         |
| `email`        | String | Yes      | User's email address             |

### Success Response

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobileNumber": "9876543210"
  }
}
```

The OTP is sent to the provided mobile number.

---

# 3. Signup OTP Verification

After receiving the OTP, the user verifies their mobile number.

## 3.1 Verify Signup OTP

### Endpoint

`POST /api/auth/signup/verify-otp`

### Request Body

```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

### Parameters

| Parameter      | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| `mobileNumber` | String | Yes      | Mobile number used during signup |
| `otp`          | String | Yes      | OTP received on mobile           |

### Success Response

```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "userId": "USR123456",
    "type": "user",
    "firstName": "Yogesh",
    "lastName": "Kumawat",
    "mobileNumber": "9876543210",
    "email": "yogesh@example.com",
    "token": "JWT_TOKEN"
  }
}
```

---

# 4. Sign In

The signin process consists of two steps:

1. Select account type and enter mobile number.
2. Verify the OTP received on the mobile number.

## 4.1 Request Sign In OTP

### Endpoint

`POST /api/auth/signin`

### Request Body

```json
{
  "type": "user",
  "mobileNumber": "9876543210"
}
```

### Parameters

| Parameter      | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| `type`         | String | Yes      | Account type: `user` or `vendor` |
| `mobileNumber` | String | Yes      | Registered mobile number         |

### Success Response

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobileNumber": "9876543210"
  }
}
```

---

# 5. Sign In OTP Verification

The user enters the OTP received on their registered mobile number.

## 5.1 Verify Sign In OTP

### Endpoint

`POST /api/auth/signin/verify-otp`

### Request Body

```json
{
  "type": "user",
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

### Parameters

| Parameter      | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| `type`         | String | Yes      | Account type: `user` or `vendor` |
| `mobileNumber` | String | Yes      | Registered mobile number         |
| `otp`          | String | Yes      | OTP received on mobile           |

### Success Response

```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "userId": "USR123456",
    "type": "user",
    "firstName": "Yogesh",
    "lastName": "Kumawat",
    "mobileNumber": "9876543210",
    "email": "yogesh@example.com",
    "token": "JWT_TOKEN"
  }
}
```

---

# 6. User Type

The API supports two account types.

| Type     | Description              |
| -------- | ------------------------ |
| `user`   | Customer/User account    |
| `vendor` | Jewellery Vendor account |

---

# 7. Common Error Response

All APIs follow a consistent error response structure.

```json
{
  "success": false,
  "message": "Invalid OTP",
  "error": {
    "code": "INVALID_OTP"
  }
}
```

### Common Error Codes

| Error Code              | Description                      |
| ----------------------- | -------------------------------- |
| `INVALID_TYPE`          | Invalid user type                |
| `INVALID_MOBILE`        | Invalid mobile number            |
| `MOBILE_ALREADY_EXISTS` | Mobile number already registered |
| `EMAIL_ALREADY_EXISTS`  | Email already registered         |
| `USER_NOT_FOUND`        | Account does not exist           |
| `INVALID_OTP`           | OTP is incorrect                 |
| `OTP_EXPIRED`           | OTP has expired                  |
| `OTP_LIMIT_EXCEEDED`    | OTP request limit exceeded       |
| `ACCOUNT_BLOCKED`       | Account has been blocked         |

---

# 8. API Summary

| Method | Endpoint                      | Purpose                                     |
| ------ | ----------------------------- | ------------------------------------------- |
| POST   | `/api/auth/signup`            | Register User/Vendor and send OTP           |
| POST   | `/api/auth/signup/verify-otp` | Verify signup OTP and complete registration |
| POST   | `/api/auth/signin`            | Request signin OTP                          |
| POST   | `/api/auth/signin/verify-otp` | Verify signin OTP and complete login        |
| GET    | `/api/auth/me`                | Fetch current authenticated account profile |

---

# 9. Authentication

After successful signup or signin, the API returns a **JWT authentication token**.

The token should be sent with subsequent protected API requests:

```http
Authorization: Bearer JWT_TOKEN
```
