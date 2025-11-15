# time-keep-mobile-app

A mobile-only timekeeping system with anti-buddy punching features using biometric authentication and GPS geofencing.

## Features

- **Face ID-Gated Authentication**: Session-based login with Face ID required on app launch
- **Secure Session Storage**: Session tokens stored in iOS Keychain (no passwords stored)
- **Biometric Clock Events**: Face ID required for every Clock In/Out event
- **GPS Geofencing**: Server-side validation ensures employees are on-site before clocking
- **Anti-Buddy Punching**: Biometric + location validation prevents time theft
- **Real-time Sync**: Immediate clock event sync to Supabase backend

## 🔐 Face ID Auth Flow

### First-Time Login
1. User logs in with email/password
2. Session tokens saved to iOS Keychain
3. App offers to enable Face ID for future logins
4. If enabled, Face ID is REQUIRED on all subsequent app launches

### Returning User (Face ID Enabled)
1. App launches → Face ID prompt appears immediately
2. Face ID success → session restored → Home screen
3. Face ID failure/cancel → session cleared → Login screen (must re-authenticate)

### Clock In/Out
1. User taps "Clock In" or "Clock Out"
2. Face ID prompt appears (REQUIRED)
3. Face ID success → location permission requested
4. GPS coordinates sent to Edge Function for geofence validation
5. If inside allowed radius → clock event created
6. If outside radius → "OUT_OF_RANGE" error shown

**📖 Full documentation:** See [FACE_ID_AUTH_IMPLEMENTATION.md](./FACE_ID_AUTH_IMPLEMENTATION.md) and [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## Tech Stack

### Mobile App
- React Native with Expo
- TypeScript
- Supabase client for authentication and data
- Expo Location for GPS
- Expo Local Authentication for biometrics
- React Navigation for routing

### Backend
- Supabase (Postgres database + Auth + Edge Functions)
- Row-Level Security for data protection
- Edge Functions for geofence validation logic

## Project Structure

```
timekeep/
├── app.json
├── App.tsx                 # Main app with navigation & auth state
├── screens/
│   ├── LoginScreen.tsx     # Employee login
│   └── HomeScreen.tsx      # Clock in/out interface
├── lib/
│   └── supabaseClient.ts   # Supabase client configuration
├── types/
│   └── database.ts         # TypeScript database types
└── components/             # Reusable components (future)
```

## Setup Instructions

### 1. Supabase Backend Setup

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings → API to get your project URL and anon key

#### 1.2 Create Database Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Create employees table
create table employees (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'employee',
  created_at timestamptz not null default now()
);

-- Create sites table
create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 100,
  created_at timestamptz not null default now()
);

-- Create clock_events table
create table clock_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id),
  site_id uuid not null references sites (id),
  type text not null check (type in ('IN', 'OUT')),
  timestamp timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  accuracy_meters double precision,
  device_label text,
  status text not null default 'OK',
  created_at timestamptz not null default now()
);
```

#### 1.3 Insert Care Home Sites

Insert the 3 care home locations (you'll need to get actual lat/lng coordinates):

```sql
-- Bodega Care Home - 460 Bodega St, Foster City, CA 94404
INSERT INTO sites (name, address, latitude, longitude, radius_meters) VALUES
('Bodega', '460 Bodega St, Foster City, CA 94404', 37.5585, -122.2711, 100);

-- Borden Care Home - 1706 Borden St, San Mateo, CA 94403
INSERT INTO sites (name, address, latitude, longitude, radius_meters) VALUES
('Borden', '1706 Borden St, San Mateo, CA 94403', 37.5486, -122.3158, 100);

-- Roberta Care Home - 1647 Roberta Dr, San Mateo, CA 94403
INSERT INTO sites (name, address, latitude, longitude, radius_meters) VALUES
('Roberta', '1647 Roberta Dr, San Mateo, CA 94403', 37.5480, -122.3149, 100);
```

**Note:** Use a geocoding service like Google Maps or OpenStreetMap to get accurate lat/lng coordinates for these addresses.

#### 1.4 Create Supabase Edge Function

Create a new Edge Function called `norcal-edge` (or `clock` if you prefer):

1. In Supabase Dashboard, go to Edge Functions
2. Create new function named `norcal-edge`
3. Replace the code with:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ClockRequestBody {
  type: 'IN' | 'OUT'
  lat: number
  lng: number
  accuracy: number
  deviceLabel?: string
}

interface ClockSuccessResponse {
  success: true
  eventId: string
  siteName: string
  siteId: string
  timestamp: string
}

interface ClockErrorResponse {
  success: false
  errorCode: string
  message: string
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ success: false, errorCode: 'UNAUTHORIZED', message: 'No authorization header' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return Response.json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Invalid token' }, { status: 401 })
    }

    // Parse request body
    const body: ClockRequestBody = await req.json()

    if (!body.type || !['IN', 'OUT'].includes(body.type)) {
      return Response.json({ success: false, errorCode: 'INVALID_TYPE', message: 'Type must be IN or OUT' }, { status: 400 })
    }

    if (typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return Response.json({ success: false, errorCode: 'INVALID_LOCATION', message: 'Invalid latitude or longitude' }, { status: 400 })
    }

    if (typeof body.accuracy !== 'number' || body.accuracy <= 0) {
      return Response.json({ success: false, errorCode: 'INVALID_ACCURACY', message: 'Invalid accuracy value' }, { status: 400 })
    }

    // Check accuracy threshold
    if (body.accuracy > 100) {
      return Response.json({ success: false, errorCode: 'BAD_ACCURACY', message: 'GPS accuracy too low. Please try again.' }, { status: 400 })
    }

    // Fetch all sites
    const { data: sites, error: sitesError } = await supabaseClient
      .from('sites')
      .select('*')

    if (sitesError || !sites) {
      return Response.json({ success: false, errorCode: 'SERVER_ERROR', message: 'Failed to fetch sites' }, { status: 500 })
    }

    // Find nearest site
    let nearestSite = sites[0]
    let minDistance = haversineDistance(body.lat, body.lng, sites[0].latitude, sites[0].longitude)

    for (const site of sites) {
      const distance = haversineDistance(body.lat, body.lng, site.latitude, site.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearestSite = site
      }
    }

    // Check geofence
    if (minDistance > nearestSite.radius_meters) {
      return Response.json({
        success: false,
        errorCode: 'OUT_OF_RANGE',
        message: `You are ${Math.round(minDistance)}m away from ${nearestSite.name}. You must be within ${nearestSite.radius_meters}m to clock ${body.type.toLowerCase()}.`
      }, { status: 400 })
    }

    // Insert clock event
    const { data: event, error: insertError } = await supabaseClient
      .from('clock_events')
      .insert({
        employee_id: user.id,
        site_id: nearestSite.id,
        type: body.type,
        lat: body.lat,
        lng: body.lng,
        accuracy_meters: body.accuracy,
        device_label: body.deviceLabel,
        status: 'OK'
      })
      .select()
      .single()

    if (insertError) {
      return Response.json({ success: false, errorCode: 'INSERT_FAILED', message: 'Failed to save clock event' }, { status: 500 })
    }

    const successResponse: ClockSuccessResponse = {
      success: true,
      eventId: event.id,
      siteName: nearestSite.name,
      siteId: nearestSite.id,
      timestamp: event.timestamp
    }

    return Response.json(successResponse)

  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ success: false, errorCode: 'SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
})
```

#### 1.5 Create Test Employees

1. In Supabase Dashboard, go to Authentication → Users
2. Click "Add user" and create employee accounts manually
3. For each user, also insert a row in the `employees` table:

```sql
-- Example for employee user
INSERT INTO employees (id, full_name, role) VALUES
('user-uuid-here', 'John Smith', 'employee');
```

### 2. Mobile App Setup

#### 2.1 Environment Variables

Create a `.env` file in the `timekeep/` directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 2.2 Install Dependencies

The dependencies are already installed. If you need to reinstall:

```bash
cd timekeep
npm install
```

#### 2.3 Configure App Permissions

Update `app.json` to include required permissions:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "This app needs location access to validate your clock-in location."
        }
      ]
    ]
  }
}
```

#### 2.4 Face ID unlock (optional)

- After the first login with email/password, the app securely stores the Supabase refresh token (no raw password) using `expo-secure-store`.
- On subsequent launches the app prompts the user with Face ID (or the device passcode) via `expo-local-authentication` and, on success, restores the session by calling `supabase.auth.setSession` with that refresh token.
- Logging out clears the stored refresh token so the next launch always requires credentials.
- Face ID unlock requires a physical device with biometrics configured; simulators/emulators do not have biometric hardware.

### 3. Testing

#### 3.1 Start the App

```bash
cd timekeep
npx expo start
```

#### 3.2 Test on Device

1. Install Expo Go on your mobile device
2. Scan the QR code shown in terminal
3. Test the login and clock functionality

#### 3.3 Verify Data

Check Supabase Dashboard → Table Editor to see clock_events being created.

## Security Features

- **Biometric Authentication**: Every clock event requires Face ID or fingerprint
- **GPS Geofencing**: Employees must be within 100m of a care home to clock in/out
- **Location Accuracy**: GPS accuracy must be within 100m
- **Row-Level Security**: Employees can only access their own data
- **JWT Authentication**: All API calls are authenticated

## Future Enhancements

- Admin dashboard for time reports
- Shift scheduling
- Payroll integration
- Push notifications
- Offline clock functionality
- Photo verification for clock events

## Troubleshooting

### Location Permission Issues
- Ensure location permissions are granted in device settings
- Try restarting the app after granting permissions

### Biometric Authentication Issues
- Ensure biometric authentication is set up on your device
- Some Android devices may not support all biometric types

### Supabase Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure Edge Functions are deployed (check for `norcal-edge` function)

### GPS Accuracy Issues
- Go outside or near a window for better GPS signal
- Wait a moment for GPS to get a better fix
- Check that location services are enabled
