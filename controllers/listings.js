const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req, res) => {
    const {category} = req.query;
    let filter={};
    if(category){
        filter.category = category
    }
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings })
};

module.exports.renderNewForm = (req, res) => {
    const categories = Listing.schema.path("category").enumValues;
    res.render("listings/new.ejs",{categories})
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews",populate:{ path: "author"},}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing })
}

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    // Guard against missing file upload
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
    // Guard against geocoding failure
    if (response.body.features.length === 0) {
        req.flash("error", "Location not found. Please enter a valid location.");
        return res.redirect("/listings/new");
    }
    if (response.body.features.length > 0) {
        newListing.geometry = response.body.features[0].geometry;
    }
    newListing.category = req.body.listing.category;
    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings");
    }
    const categories = Listing.schema.path("category").enumValues;
    let originalImageUrl = listing.image?.url || "";
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    }
    res.render("listings/edit.ejs", { listing ,originalImageUrl,categories})
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params; 
    let listing= await Listing.findByIdAndUpdate(id, {...req.body.listing})
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image={url, filename}
        await listing.save()
    }
    
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id)
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings")
}

module.exports.searchListings = async(req,res)=>{
    const {q} = req.query;

     const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs",{allListings})
}