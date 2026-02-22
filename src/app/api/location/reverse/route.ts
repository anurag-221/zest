import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zoom = searchParams.get('zoom') || '18';
    const addressdetails = searchParams.get('addressdetails') || '1';

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&addressdetails=${addressdetails}`;
        
        const response = await fetch(url, {
            headers: {
                // Nominatim requires a valid user-agent
                'User-Agent': 'EcommerceApp/1.0 (anurag@ecommerce.local)'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Reverse Geocoding Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 500 });
    }
}
