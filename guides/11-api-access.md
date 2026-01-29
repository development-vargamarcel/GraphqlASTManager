# API Access

The application provides a feature to generate Personal Access Tokens (PATs) that allow you to authenticate with the API programmatically. This is useful for building external integrations or scripts that interact with your data.

## Generating a Token

1.  Log in to your account.
2.  Navigate to the dashboard (`/demo/lucia`).
3.  Click on the **API Access** tab.
4.  Enter a name for your token (e.g., "Development Script", "Mobile App").
5.  Click **Generate**.
6.  **Important:** Copy the displayed token immediately. It will only be shown once. If you lose it, you will need to generate a new one.

## Using a Token

To use the token, include it in the `Authorization` header of your HTTP requests to the API. The format should be `Bearer <your_token>`.

### Example Request

```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:5173/api/v1/user
```

## Available Endpoints

### Get User Profile

`GET /api/v1/user`

Returns the authenticated user's profile information.

**Response:**

```json
{
	"id": "user_123...",
	"username": "johndoe",
	"age": 30,
	"bio": "Hello world!"
}
```

### Get User Notes

`GET /api/v1/notes`

Returns a list of the authenticated user's notes.

**Response:**

```json
[
	{
		"id": "note_abc...",
		"userId": "user_123...",
		"title": "My Note",
		"content": "This is a note.",
		"tags": ["personal", "todo"],
		"createdAt": "2023-10-27T10:00:00.000Z",
		"updatedAt": "2023-10-27T10:00:00.000Z"
	}
]
```

## Revoking a Token

If you suspect a token has been compromised or you no longer need it:

1.  Navigate to the **API Access** tab in the dashboard.
2.  Find the token in the list.
3.  Click the **Revoke** button.

The token will be immediately invalidated and can no longer be used.

## Tracking Usage

You can monitor when your tokens were last used in the **API Access** tab. The "Last Used" column displays the timestamp of the most recent successful API request made with each token. This helps you identify unused tokens or suspicious activity.
