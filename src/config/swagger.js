import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Shared Transport Management System API",
      version: "1.0.0",
      description: "API documentation for the Smart Shared Transport Management System"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Register: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Rupesh" },
            email: { type: "string", format: "email", example: "rupesh@example.com" },
            password: { type: "string", format: "password", example: "Password@123" }
          }
        },
        Login: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "rupesh@example.com" },
            password: { type: "string", format: "password", example: "Password@123" }
          }
        },
        OTPVerification: {
          type: "object",
          required: ["email", "act_otp"],
          properties: {
            email: { type: "string", format: "email", example: "rupesh@example.com" },
            act_otp: { type: "string", example: "123456" }
          }
        },
        ResetPassword: {
          type: "object",
          required: ["email", "act_otp", "new_password"],
          properties: {
            email: { type: "string", format: "email", example: "rupesh@example.com" },
            act_otp: { type: "string", example: "123456" },
            new_password: { type: "string", format: "password", example: "NewPassword@123" }
          }
        },
        ChangePassword: {
          type: "object",
          required: ["email", "old_password", "new_password"],
          properties: {
            email: { type: "string", format: "email", example: "rupesh@example.com" },
            old_password: { type: "string", format: "password", example: "OldPassword@123" },
            new_password: { type: "string", format: "password", example: "NewPassword@123" }
          }
        },
        BookingLocation: {
          type: "object",
          required: ["lat", "long"],
          properties: {
            lat: { type: "number", example: 18.1067 },
            long: { type: "number", example: 83.3956 }
          }
        },
        Complaint: {
          type: "object",
          required: ["complaint"],
          properties: {
            complaint: { type: "string", example: "Driver was late today" }
          }
        },
        DriverRating: {
          type: "object",
          required: ["rating"],
          properties: {
            rating: { type: "number", minimum: 1, maximum: 5, example: 5 }
          }
        }
      }
    }
  },
  apis: []
};

const jsonBody = (schema) => ({
  required: true,
  content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } }
});

const authResponse = {
  400: { description: "Invalid request or credentials" },
  500: { description: "Internal server error" }
};

const protectedOperation = (operation) => ({
  ...operation,
  security: [{ bearerAuth: [] }]
});

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = {
  "/api/auth/v1/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      requestBody: jsonBody("Register"),
      responses: { 201: { description: "OTP sent successfully" }, ...authResponse }
    }
  },
  "/api/auth/v1/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      requestBody: jsonBody("Login"),
      responses: { 200: { description: "Login successful" }, ...authResponse }
    }
  },
  "/api/auth/v1/refreshtoken": {
    post: {
      tags: ["Authentication"],
      summary: "Generate a new access token",
      responses: { 200: { description: "Access token generated" }, ...authResponse }
    }
  },
  "/api/auth/v1/verifyemail": {
    post: {
      tags: ["Authentication"],
      summary: "Verify email using OTP",
      requestBody: jsonBody("OTPVerification"),
      responses: { 200: { description: "Email verified" }, ...authResponse }
    }
  },
  "/api/auth/v1/forgotpassword": {
    post: {
      tags: ["Authentication"],
      summary: "Send password reset OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: { email: { type: "string", format: "email", example: "rupesh@example.com" } }
            }
          }
        }
      },
      responses: { 200: { description: "OTP sent successfully" }, ...authResponse }
    }
  },
  "/api/auth/v1/forgotpasswordOTP": {
    post: {
      tags: ["Authentication"],
      summary: "Verify forgot-password OTP",
      requestBody: jsonBody("OTPVerification"),
      responses: { 200: { description: "OTP verified" }, ...authResponse }
    }
  },
  "/api/auth/v1/resetpassword": {
    post: {
      tags: ["Authentication"],
      summary: "Reset password using OTP",
      requestBody: jsonBody("ResetPassword"),
      responses: { 200: { description: "Password reset successfully" }, ...authResponse }
    }
  },
  "/api/auth/v1/upload-pic": {
    post: {
      tags: ["Authentication"],
      summary: "Upload profile image",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["image"],
              properties: { image: { type: "string", format: "binary" } }
            }
          }
        }
      },
      responses: { 200: { description: "Image uploaded successfully" }, 500: { description: "No file uploaded" } }
    }
  },
  "/api/student/v1/logout": {
    post: protectedOperation({
      tags: ["Student"],
      summary: "Logout student",
      responses: { 200: { description: "Successfully logged out" }, ...authResponse }
    })
  },
  "/api/student/v1/changepassword": {
    post: protectedOperation({
      tags: ["Student"],
      summary: "Change student password",
      requestBody: jsonBody("ChangePassword"),
      responses: { 200: { description: "Password updated successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/me": {
    get: protectedOperation({
      tags: ["Student"],
      summary: "Get current student details",
      responses: { 200: { description: "Student details retrieved successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/book-auto": {
    post: protectedOperation({
      tags: ["Student"],
      summary: "Mark student availability and request auto allocation",
      requestBody: jsonBody("BookingLocation"),
      responses: { 200: { description: "Auto booking processed" }, ...authResponse }
    })
  },
  "/api/student/v1/students/bookings": {
    get: protectedOperation({
      tags: ["Student Bookings"],
      summary: "Get student bookings",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
      ],
      responses: { 200: { description: "Bookings retrieved successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/bookings/{booking_id}": {
    get: protectedOperation({
      tags: ["Student Bookings"],
      summary: "Get a specific student booking",
      parameters: [{ name: "booking_id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Booking retrieved successfully" }, 404: { description: "Booking not found" }, ...authResponse }
    }),
    delete: protectedOperation({
      tags: ["Student Bookings"],
      summary: "Cancel a student booking",
      parameters: [{ name: "booking_id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Ride cancelled successfully" }, 404: { description: "Booking could not be cancelled" }, ...authResponse }
    })
  },
  "/api/student/v1/students/trips": {
    get: protectedOperation({
      tags: ["Student Trips"],
      summary: "Get student trip history",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
      ],
      responses: { 200: { description: "Trip history retrieved successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/trips/{tripId}": {
    get: protectedOperation({
      tags: ["Student Trips"],
      summary: "Get details of a specific trip",
      parameters: [{ name: "tripId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Trip details retrieved successfully" }, 404: { description: "Trip or driver not found" }, ...authResponse }
    })
  },
  "/api/student/v1/students/drivers": {
    get: protectedOperation({
      tags: ["Student Complaints"],
      summary: "Get drivers available for complaints",
      responses: { 200: { description: "Driver list retrieved successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/drivers/{driver_id}": {
    post: protectedOperation({
      tags: ["Student Complaints"],
      summary: "Raise complaint against a driver",
      parameters: [{ name: "driver_id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: jsonBody("Complaint"),
      responses: { 201: { description: "Complaint successfully raised" }, ...authResponse }
    }),
    put: protectedOperation({
      tags: ["Student Ratings"],
      summary: "Rate a driver",
      parameters: [{ name: "driver_id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: jsonBody("DriverRating"),
      responses: { 201: { description: "Driver rating submitted successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/vehicles": {
    get: protectedOperation({
      tags: ["Student Complaints"],
      summary: "Get vehicles available for complaints",
      responses: { 200: { description: "Vehicle list retrieved successfully" }, ...authResponse }
    })
  },
  "/api/student/v1/students/vehicles/{vehicle_id}": {
    post: protectedOperation({
      tags: ["Student Complaints"],
      summary: "Raise complaint against a vehicle",
      parameters: [{ name: "vehicle_id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: jsonBody("Complaint"),
      responses: { 201: { description: "Complaint successfully raised" }, ...authResponse }
    })
  },
  "/api/student/v1/students/live-trip": {
    get: protectedOperation({
      tags: ["Student Trips"],
      summary: "Get student's current live trip",
      responses: { 200: { description: "Current trip retrieved successfully" }, ...authResponse }
    })
  }
};

export default swaggerSpec;
