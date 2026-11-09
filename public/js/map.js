
if (listing.geometry && listing.geometry.coordinates) {
    const map = new mapboxgl.Map({
        accessToken: mapToken,
        container: 'map',
        center: listing.geometry.coordinates,
        zoom: 9
    });

    const marker = new mapboxgl.Marker({color:"red"})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(`<h4>${listing.location}</h4><p>Exact Location will be provided after booking</p>`))
        .addTo(map);
}