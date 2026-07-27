// Force Google DNS
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
// ... baaki code same

console.log("API KEY:", process.env.GEMINI_API_KEY);


const express = require("express");
const mongoose = require("mongoose");





const cors = require("cors");

// step--2  api gen

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);







const Products = require("./models/Products");
const User = require("./models/User"); 
const Cart = require("./models/Cart");
const Order = require("./models/Order");


const app = express();
app.use("/uploads", express.static("uploads"));




// middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

  

console.log("MONGO URI:", process.env.MONGO_URI);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


//product add krne ke lie mongo mai ---file ke name k sath
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });



app.post("/add-product", upload.array("photos", 3), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const photoUrls = req.files.map((file) => file.filename);

    const product = new Products({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      photos: photoUrls,
      location: req.body.location,
      category: req.body.category,
      condition: req.body.condition,
      seller: {
        name: req.body.sellerName,
        email: req.body.sellerEmail,
        phone: req.body.sellerPhone,
      },
    });

    console.log("product seller", product.seller);
    await product.save();
    res.json({ success: true });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err.message); // ✅ error dikhega
    res.status(500).json({ message: err.message });
  }
});

//2
const nodemailer=require('nodemailer');
app.post("/sign-up", async (req,res)=>{
  try{

  const OTP=Math.floor(100000 + Math.random()*900000).toString();  //6 digit ka random number generate krne ke lie
  const OTPexpiry=new Date(Date.now()+1*60*1000);  //OTP 1 min k lie valid rhega
  

  const allowedDomains=[
 "srmist.edu.in"
];


const email = req.body.email;

const studentEmailPattern = /(\.edu|\.ac\.in|\.edu\.in)$/;

const domain = email.split("@")[1];


if(!studentEmailPattern.test(domain)){

  return res.status(400).json({
    message:"Please use your official college email ID"
  });

}

  const newUser = new User({...req.body,OTP,OTPexpiry,isVerified:false});


  //..ye sspread operator hai
  //save krne k bd jo object create hua tha--- ab new document create hgai collection mai same data ke sath
  await newUser.save();
  
 const transporter=nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.email,
    pass:process.env.pass
  }
 })
 transporter.sendMail({
  from:process.env.email,
  to:newUser.email,
  subject:"OTP for email verification",
  text:`Your OTP is ${OTP}. It is valid for 1 minute.`
 })

   res.status(201).json({
    message: "User created"
  });

} catch (err) {

  console.log(err);

  res.status(500).json({
    message: err.message
  });
}});


app.post("/verify-otp",async (req,res)=>{

  try{
    const user=await User.findOne({email:req.body.email});
    console.log(user.OTP,req.body.otp);
    if(user.OTP==req.body.otp && user.OTPexpiry>Date.now()){
      user.isVerified=true;
      await user.save();
      return res.status(200).json({message:"OTP verified successfully!",email:user.email,
  username:user.username});
    }
    return res.status(401).json({message:"Invalid OTP or OTP expired!"});
  } catch(err){
    console.log(err);
    return res.status(500).json({message:"Server error while verifying OTP!"});
  }
  }
)

app.post("/resend-otp", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 2 * 60 * 1000
    );

    user.OTP = otp;
    user.OTPexpiry = otpExpiry;

    await user.save();

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.email,
          pass: process.env.pass,
        },
      });

    await transporter.sendMail({
      from: process.env.email,
      to: req.body.email,
      subject: "OTP for Email Verification",
      text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    });

    return res.status(200).json({
      message: "OTP resent successfully!",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message:
        "Server error while resending OTP!",
    });
  }
});


//3
app.post("/login", async (req,res)=>{
  try{
  
 
  //jo frontend se data aya hai email or password usme se email chahiye toh uske lie 
  // const email=req.body.email;
  // const password=req.body.password;
  //short way hai iska 
  //req.body mai--ek object hai {email:"",password:""}
  const {email,password}=req.body; 
  

  //idhr error tha
  const user = await User.findOne({ email: email });



  if(!user){
    return res.status(404).json({message:"User not found"});
  }


  //cehck for password
  if(user.password!=password){
    return res.status(401).json({message:"Invalid credentials"});
  }

if(!user.isVerified){
  return res.status(403).json({message:"Please verify your email first!"});
}
//agr user ki email or pass match hgya mtlb signup succefull tha or isverified true hua toh again login krte tym verify krege 
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 2 * 60 * 1000
    );

    user.OTP = otp;
    user.OTPexpiry = otpExpiry;

    await user.save();

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.email,
          pass: process.env.pass,
        },
      });

    await transporter.sendMail({
      from: process.env.email,
      to: req.body.email,
      subject: "OTP for Email Verification",
      text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    });



  //idhr hmne username send krdia frontend ko us bnde ka jisne login kia hai taki navbar m show kr ske
  //jb bhi backend se data bhjna ho frontend ko mtlb like message smthng toh message use krege  
 res.json({
  message:"Login successful",
  email:user.email,
  username:user.username
});
}catch(err){
  //agr new ya server error aya toh
  console.error("Login error:", err);
   res.status(500).json({ message: err.message });
}
});



//4
app.post("/add-to-cart", async (req, res) => {
  try {
    const { userEmail, productId, photos,title,price } = req.body;

    const existing = await Cart.findOne({ userEmail, productId });

    if (existing) {
      existing.quantity += 1;

      // purane/incomplete entries ko backfill kardo
      if (!existing.photos || existing.photos.length === 0) existing.photos = photos;
      if (!existing.title) existing.title = title;
      if (existing.price == null) existing.price = price;


      await existing.save();

      return res.json({
        message: "Product added successfully to cart!",
      });
    }

   
    const newCartitem = new Cart({ userEmail, productId, photos, title, price });
    await newCartitem.save();

    return res.json({
      message: "Product added successfully to cart!",
    });
  } catch (err) {
    console.log("add to cart server error:", err);
    return res.json({
      message: "Server error while adding to cart",
    });
  }
});


//5
app.get("/cart-items/:email", async(req,res)=>{
  try{
    const useremail=req.params.email;
    const Cartitems=await Cart.find({userEmail:useremail});
    res.json(Cartitems);
  }catch(err){
    console.error("Server error while fetching cart items:", err);
    return res.status(500).json({message:"Server error while fetching cart items"});
  }
  }
)


//6
app.delete("/remove-from-cart/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await Cart.findByIdAndDelete(id);

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Error removing item" });
  }
});


//7
app.get("/products", async (req, res) => {
  const products = await Products.find();
  res.json(products);
});


//8
app.patch("/decrease-quan/:id", async(req,res)=>{
  try{
    const item=await Cart.findById(req.params.id);
    if(!item){
      return res.status(404).json({message:"gambhir gdbd hai!"});

    }

    if(item.quantity>1){
      item.quantity-=1;
      await item.save();
      return res.json({message:"quantity decrease hogai!"});
    }
    else{
      //remove krna hai item
      await Cart.findByIdAndDelete(req.params.id);
      return res.json({message:"quantity 1 thi toh remove krdia item from Cart!"});
    }
  }catch(err){
    console.error("server error agya hai quantity decrease krte time:", err);
    return res.status(500).json({message:"Server error while decreasing quantity"});
  }
})


app.get("/products/:id", async (req, res) => {
  try {
    // ✅ Pehle check karo ID valid hai ya nahi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.log(error); // ← yeh bhi add karo debugging ke liye
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/sellers/:id", async (req, res) => {
  try{
  //database se seller ka data chahiye 
  //colection mai id se us product /mtlb seller ko dhundo
  //url se id fech krne k lie ---req url hai
  const product=await Products.findById(req.params.id);

  if(!product){
    //agr koi product uis id se exist nhi krta toh null dega or agr null/undefined/empty hai toh return krege error --neche wala ru nhi hga
    return res.status(404).json({message:"Seller not found"});
  }

  //agr product mil gya pr seller details fill nhi ki ya seller field hi exist na krti ho toh 
  if (!product.seller || !product.seller.name) {
      return res.status(404).json({ message: "Seller details not added yet" });
    }

  
    //agr product or seller dono mil hgya toh 
    return res.json(product.seller);
     }catch(error)
    {
      //y catch jb run krega jb ya toh try ho,,ya throw use kia ho --ya server error ho ,internet error 
      console.log(error);
      return res.status(500).json({message:"Server error"});
  }})

/////errorrrrr--db m update nhi hrha 
// app.put("/products/:id",async(req,res)=>{
    

//   const updated=await Products.findByIdAndUpdate(
//     req.params.id,
    
//      { $set: req.body },
//     {new:true}   //updated data vapis do
    
//   );
//   console.log(updated);
//   res.json(updated);

// });


app.post("/save-search", async (req, res) => {

  try {

    const { email, searchText } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // add search
    user.searchHistory.push(searchText);

    // remove duplicates
    user.searchHistory = [...new Set(user.searchHistory)];

    await user.save();

    res.json({
      message: "Search saved"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

});




app.get("/gemini-test", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent("Hello");

    res.json({
      reply: result.response.text()
    });

  } catch (err) {
    console.error(err);
    res.json({
      error: err.message
    });
  }
});



//to delete existing data
app.delete("/products/:id",async(req,res)=>{
  await Products.findByIdAndDelete(req.params.id);
  res.json({message:"Product deleted successfully!"});
});


// server start---deploy krne ke lie
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.post("/generate-description", async (req, res) => {
  try {
    const { title, category, condition, location, quantity, photoBase64 } = req.body;

   const basePrompt = `
Write a professional marketplace product description.

Product Details:
Title: ${title}
Category: ${category}
Condition: ${condition}
Location: ${location}
quantity: ${quantity}

IMPORTANT:
Generate the description in EXACTLY this format:

[Short introductory paragraph about the product]

Product Highlights:
✅ Feature 1
✅ Feature 2
✅ Feature 3
✅ Feature 4
✅ Feature 5

📍 Location: ${location}
📦 Condition: ${condition}
🏷️ Category: ${category}
🔢 Quantity: ${quantity}

[One-line call to action encouraging the buyer]

RULES:
- Do NOT use "*" bullets.
- Use the heading "Product Highlights:" exactly.
- Use ✅ for each highlight.
- Mention color, appearance, and visible condition if a photo is provided.
- If category is "Clothes" or clothing-related (shirts, jeans, jackets, ethnic wear, shoes, etc.), mention size (if given), fabric/material look, fit type (slim/regular/loose), and occasion suitability (casual/formal/party wear) wherever relevant and visible.
- Keep language simple, professional, and attractive.
- Description should be suitable for a student marketplace.
- Do not mention information that is not visible or provided.
- Return only the description text.

Now write the description following the format above EXACTLY:`;

    const promptParts = [
      {
        text: photoBase64
          ? `${basePrompt}\n\nAlso look at the attached photo carefully — mention the color and visible physical condition/appearance from the photo in the relevant bullet.`
          : basePrompt,
      },
    ];

    if (photoBase64) {
      promptParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: photoBase64,
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: {
        temperature: 0.4,   // 👈 kam creativity, zyada instruction-following
      },
    });

    res.json({ description: result.response.text() });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});
app.post("/predict-price", async (req, res) => {
  try {
    const { title, category, condition, quantity, photoBase64 } = req.body;

    const instructions = `You are a pricing expert for a STUDENT marketplace in India (like OLX/used goods between college students). Items here are LOW-budget, everyday used items — NOT premium/luxury goods.

Product Name: ${title}
Category: ${category}
Condition: ${condition}
Quantity: ${quantity} (this is the number of items being sold TOGETHER as one listing — e.g. "3" means a pack of 3 items, price the WHOLE pack, not just one unit)

IMPORTANT pricing context for student marketplace (use these as reference anchors, PER SINGLE UNIT):
- Stationery (pens, notebooks): ₹20 - ₹200 per unit
- Books: ₹50 - ₹800 per unit
- Electronics accessories (mouse, cables, chargers,calculator): ₹100 - ₹1500 per unit
- Bags/backpacks: ₹200 - ₹2000 per unit
- Furniture (study table, chair): ₹500 - ₹4000 per unit
- Laptops/phones: ₹3000 - ₹40000 per unit
- Clothes - Casual (T-shirts, tops, kurtas): ₹50 - ₹250 per unit
- Clothes - Bottoms (jeans, trousers, joggers): ₹150 - ₹500 per unit
- Clothes - Heavy/Outer (jackets, hoodies, sweatshirts): ₹200 - ₹800 per unit
- Clothes - Ethnic/Formal wear (suits, sarees, blazers): ₹300 - ₹1500 per unit
- Footwear (shoes, sneakers, sandals): ₹150 - ₹900 per unit

For "Clothes" category specifically: figure out the sub-type from the title (casual/bottom/outer/ethnic) and price accordingly using the relevant anchor above. Branded items (Nike, Adidas, Levi's, etc.) can go slightly higher within reason, but never premium/boutique pricing — this is a budget student resale platform.

Multiply the reasonable per-unit price by the quantity (with a slight bulk discount, e.g. 10-15% off for buying multiple together) to get the final pack price.

Unless the product name EXPLICITLY mentions a premium/luxury brand (e.g., "Mont Blanc", "Apple", "iPhone"), assume it is a regular, budget/mid-range item.

Respond ONLY in this JSON format, nothing else, no extra text:
{
  "minPrice": <number>,
  "maxPrice": <number>,
  "suggestedPrice": <number>,
  "reason": "<one short sentence, max 12 words, mention quantity if relevant>"
}`;

    const promptParts = [
      {
        text: photoBase64
          ? `${instructions}\n\nAlso examine the photo for visible quality/brand clues to refine the estimate.`
          : instructions,
      },
    ];

    if (photoBase64) {
      promptParts.push({
        inlineData: { mimeType: "image/jpeg", data: photoBase64 },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const priceData = JSON.parse(result.response.text());

    // 🔒 safety clamp — quantity ke hisaab se cap bhi adjust karo
    const MAX_REASONABLE_PRICE = {
      stationery: 1000,
      books: 1000,
      electronics: 5000,
      furniture: 5000,
      clothes: 2000,      // 👈 NEW — clothes ka cap
      footwear: 1200,     // 👈 NEW — agar footwear alag category hai toh
      default: 3000,
    };
    const baseCap = MAX_REASONABLE_PRICE[category?.toLowerCase()] || MAX_REASONABLE_PRICE.default;
    const cap = baseCap * Math.max(quantity, 1);   // quantity ke hisaab se cap badhao

    if (priceData.suggestedPrice > cap) {
      priceData.suggestedPrice = cap;
      priceData.maxPrice = Math.min(priceData.maxPrice, cap);
      priceData.reason = "Price adjusted to typical student marketplace range";
    }

    res.json(priceData);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


// app.get("/recommendations/:email", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.params.email });

//     if (!user) {
//       return res.json([]);
//     }

//     const products = await Products.find().limit(50);

//     if (products.length === 0) {
//       return res.json([]);
//     }

//     // Agar user ki search history empty hai, AI ko call karne ka koi fayda nahi
//     if (!user.searchHistory || user.searchHistory.length === 0) {
//       return res.json([]);
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     // Sirf product IDs + minimal info bhejo AI ko, taki woh sirf relevant IDs chune
//     const productSummaries = products.map(p => ({
//       id: p._id.toString(),
//       title: p.title,
//       category: p.category,
//       price: p.price,
//     }));

//     const prompt = `You are a recommendation system for a student marketplace.

// User search history:
// ${JSON.stringify(user.searchHistory)}

// Available products:
// ${JSON.stringify(productSummaries)}

// Pick the 6 most relevant product IDs based on the user's search history.
// If nothing is relevant, return an empty array.

// Respond ONLY in this JSON format, nothing else, no extra text:
// {
//   "productIds": ["id1", "id2", "id3"]
// }`;

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: {
//         temperature: 0.3,
//         responseMimeType: "application/json",
//       },
//     });

//     let productIds = [];
//     try {
//       const parsed = JSON.parse(result.response.text());
//       productIds = Array.isArray(parsed.productIds) ? parsed.productIds : [];
//     } catch (parseErr) {
//       console.log("Recommendation JSON parse error:", parseErr);
//       return res.json([]);
//     }

//     // Asli product documents fetch karo un IDs ke liye, original order preserve karke
//     const recommendedProducts = productIds
//       .map(id => products.find(p => p._id.toString() === id))
//       .filter(Boolean);

//     res.json(recommendedProducts);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Recommendation error" });
//   }
// });


app.get("/recommendations/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    // user nahi mila ya kabhi kuch search nahi kiya
    if (!user || !user.searchHistory || user.searchHistory.length === 0) {
      return res.json([]);
    }

    const products = await Products.find();

    // jo bhi product ka title ya category, kisi search history word se match kare
    const recommended = products.filter((p) => {
      return user.searchHistory.some((search) => {
        const word = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(word) ||
          p.category.toLowerCase().includes(word)
        );
      });
    });

    res.json(recommended.slice(0, 6)); // sirf top 6 dikhao
  } catch (err) {
    console.log(err);
    res.json([]); // error ho to khaali list, page nahi todna
  }
});



//img analysis
app.post("/analyze-image", async (req, res) => {
  try {
    const { photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ message: "No photo provided" });
    }

    // ✅ tere allowed categories — Browse filter ke same rakhe hain
    const allowedCategories = [
      "Books", "Electronics", "Stationery", "Notes",
      "Sports", "Furniture", "Accessories", "Clothes"
    ];

    const prompt = `You are analyzing a product photo for a student marketplace listing.

Look at the image carefully and identify:
1. A short, clear product title (2-4 words, e.g. "Blue Denim Jacket", "Scientific Calculator", "Wooden Study Table")
2. The most appropriate category — pick EXACTLY one from this list: ${allowedCategories.join(", ")}
3. The visible condition of the item — choose exactly one word: "New" or "Used"

RULES:
- Title must contain ONLY alphabets and spaces (no numbers, no brand names, no special characters, no punctuation).
- Category MUST exactly match one option from the list above, spelled exactly as given (case-sensitive).
- If the item looks unused/brand new with tags, say "New". Otherwise say "Used".
- If you genuinely cannot identify the product, set title to "" and category to "Accessories".

Respond ONLY in this JSON format, nothing else, no extra text:
{
  "title": "<string>",
  "category": "<one of the allowed categories>",
  "condition": "New or Used"
}`;

    const promptParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: photoBase64,
        },
      },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(result.response.text());

    // 🔒 safety check — agar AI ne galat category bheji toh fallback
    if (!allowedCategories.includes(analysis.category)) {
      analysis.category = "Accessories";
    }
    if (analysis.condition !== "New" && analysis.condition !== "Used") {
      analysis.condition = "Used";
    }

    res.json(analysis);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


app.get("/Sellerproducts/:email", async (req, res) => { // ✅ fixed: route param ":email" + removed extra "("
  try {
    console.log("printing",req.params.email);
    const products = await Products.find({ "seller.email": req.params.email });
    console.log(products.length);

    // ✅ fixed: array ke liye .length check, !products kabhi true nahi hoga
    if (products.length === 0) {
      return res.status(404).json({ message: "No products are being sold by the user" });
    }

    return res.json(products);
  } catch (error) { // ✅ fixed: error use kiya, err nahi
    return res.status(500).json({ message: error.message });
  }
});





// ============================================================
// ORDER ROUTES — paste these in server.js
// File ke TOP mein add kar:
// const Order = require("./models/Order");
// ============================================================

// ✅ 1. Buyer places order (Buy Now form submit)
app.post("/create-order", async (req, res) => {
  try {
    const {
      productId, productTitle, productPhoto, productPrice,
      buyerName, buyerEmail, buyerPhone, buyerAddress,
      sellerEmail, sellerName,
    } = req.body;

    const order = new Order({
      productId, productTitle, productPhoto, productPrice,
      buyerName, buyerEmail, buyerPhone, buyerAddress,
      sellerEmail, sellerName,
      status: "pending",
    });

    await order.save();

    // Email to seller — new order notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: sellerEmail,
      subject: `New Order Received — ${productTitle}`,
      html: `
        <h2>New Order on StudentMarketPlace!</h2>
        <p><b>Product:</b> ${productTitle}</p>
        <p><b>Price:</b> ₹${productPrice}</p>
        <hr/>
        <h3>Buyer Details:</h3>
        <p><b>Name:</b> ${buyerName}</p>
        <p><b>Email:</b> ${buyerEmail}</p>
        <p><b>Phone:</b> ${buyerPhone}</p>
        <p><b>Address:</b> ${buyerAddress}</p>
        <hr/>
        <p>Log in to your seller dashboard to <b>Accept or Reject</b> this order.</p>
      `,
    });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ 2. All orders for a seller (pending + active)
app.get("/seller-orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ sellerEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 3. All orders for a buyer (track order page)
app.get("/buyer-orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ buyerEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 4. Seller — Accept order + set delivery charge
//      Buyer receives an email to confirm the total amount on the Track Order page
app.patch("/order-accept/:id", async (req, res) => {
  try {
    const { deliveryCharge } = req.body;

    if (deliveryCharge === undefined || deliveryCharge === null || deliveryCharge < 0 || isNaN(Number(deliveryCharge))) {
      return res.status(400).json({ message: "Please enter a valid delivery charge!" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (typeof order.productPrice !== "number" || isNaN(order.productPrice)) {
      console.error("⚠️ order-accept: productPrice invalid for order", order._id, order.productPrice);
      return res.status(400).json({ message: "This order's product price is missing or invalid. It may be an old/corrupt order." });
    }

    order.status = "accepted";
    order.deliveryCharge = Number(deliveryCharge);
    order.totalAmount = order.productPrice + Number(deliveryCharge);
    await order.save();

    console.log("✅ order-accept:", { productPrice: order.productPrice, deliveryCharge: order.deliveryCharge, totalAmount: order.totalAmount });

    // Email to buyer — order accepted + delivery charge + total
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.buyerEmail,
      subject: `Order Accepted — ${order.productTitle}`,
      html: `
        <h2>Your order has been accepted!</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <p><b>Product Price:</b> ₹${order.productPrice}</p>
        <p><b>Delivery Charge:</b> ₹${order.deliveryCharge}</p>
        <h3>Total Amount: ₹${order.totalAmount}</h3>
        <hr/>
        <p>Go to your <b>Track Order</b> page to <b>Accept</b> or <b>Reject</b> this total amount.</p>
      `,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 5. Seller — Reject order
app.patch("/order-reject/:id", async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    // Email to buyer — order rejected
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.buyerEmail,
      subject: `Order Rejected — ${order.productTitle}`,
      html: `
        <h2>Sorry! Your order was rejected.</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
        <p>You can browse other products on StudentMarketPlace.</p>
      `,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 6. Buyer — Confirm total amount (accept delivery charge) → status: packed, email to seller
app.patch("/order-confirm/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "packed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.sellerEmail,
      subject: `Buyer Confirmed Order — ${order.productTitle}`,
      html: `
        <h2>The buyer has accepted the total amount!</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
        <p>You can now pack and dispatch the order.</p>
      `,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 7. Buyer — Reject total amount → order cancelled, email to seller
app.patch("/order-cancel/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled_by_buyer" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.sellerEmail,
      subject: `Order Cancelled by Buyer — ${order.productTitle}`,
      html: `
        <h2>The buyer has cancelled this order.</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <p><b>Delivery Charge offered:</b> ₹${order.deliveryCharge}</p>
        <p>The buyer did not accept the total amount. The order has been cancelled.</p>
      `,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 8. Seller — Mark as Packed (no-op kept for compatibility, packed is already set by buyer confirm)
app.patch("/order-pack/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: "packed" }, { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 9. Seller — Dispatch order (courier, tracking ID, estimated delivery, own Paytm number)
//      OTP is generated HERE and emailed to the buyer right away.
//      The buyer can only SUBMIT/VERIFY it later, once the seller confirms payment (see route 11/12).
app.patch("/order-dispatch/:id", async (req, res) => {
  try {
    console.log("entered");
    const { courierName, trackingId, estimatedDelivery, sellerPaytmNumber } = req.body;

    if (!sellerPaytmNumber || sellerPaytmNumber.length < 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit Paytm number!" });
    }

    // 6-digit OTP generated at dispatch time and saved to the order right away
    const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const deliveryOTPExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // valid for 7 days
     console.log("3");

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "dispatched",
        courierName,
        trackingId,
        estimatedDelivery,
        sellerPaytmNumber,
        deliveryOTP,
        deliveryOTPExpiry,
      },
      { new: true }
    );
     console.log("4");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });
     console.log("5");

    await transporter.sendMail({
      from: process.env.email,
      to: order.buyerEmail,
      subject: `Your Order is Dispatched — ${order.productTitle}`,
      html: `
        <h2>Your order is on the way! 🎉</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <hr/>
        <h3>Delivery Details:</h3>
        <p><b>Courier:</b> ${courierName}</p>
        <p><b>Tracking ID:</b> ${trackingId}</p>
        <p><b>Estimated Delivery:</b> ${estimatedDelivery}</p>
        <hr/>
        <p>When your order arrives, pay <b>₹${order.totalAmount}</b> to the seller's Paytm number below, then click "I Have Paid" on your Track Order page.</p>
        <p><b>Seller Paytm Number:</b> ${sellerPaytmNumber}</p>
        <hr/>
        <h3>🔐 Your Delivery OTP: <span style="font-size:24px;color:#6C63FF">${deliveryOTP}</span></h3>
        <p>You will need to enter this OTP to confirm delivery, <b>after</b> the seller confirms your payment. Keep it safe — do not share it with anyone else.</p>
      `,
    });
    
    console.log("mail gai disaptch");
    res.json({ success: true, order });
  } catch (err) {
   
  console.error("Dispatch Error:", err);
  res.status(500).json({
    success: false,
    message: err.message,
  });

  }
});


// ✅ 10. Buyer — "I Have Paid" — payment claim, email to seller for confirmation
app.patch("/order-payment-claim/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "payment_claimed", paymentClaimedByBuyer: true },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.sellerEmail,
      subject: `Buyer Claims Payment Done — ${order.productTitle}`,
      html: `
        <h2>The buyer says they have paid!</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <p><b>Buyer:</b> ${order.buyerName}</p>
        <p><b>Amount:</b> ₹${order.totalAmount}</p>
        <p>Please check your Paytm account, then go to your seller dashboard and click <b>Confirm</b>. The buyer can only verify the delivery OTP after you confirm payment.</p>
      `,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 11. Seller — Confirm payment received → unlocks OTP verification for the buyer
//       (OTP itself was already generated and emailed at dispatch time — route 9)
app.patch("/order-payment-confirm/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "payment_claimed") {
      return res.status(400).json({ message: "The buyer hasn't claimed payment yet!" });
    }

    order.status = "payment_confirmed";
    order.paymentConfirmedBySeller = true;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ 12. Buyer — Verify OTP (the one emailed at dispatch time) → Mark as Delivered
app.patch("/order-verify-otp/:id", async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "payment_confirmed") {
      return res.status(400).json({ message: "Please wait for the seller to confirm your payment first!" });
    }

    if (order.deliveryOTP !== otp) {
      return res.status(401).json({ message: "Incorrect OTP! Please try again." });
    }

    if (order.deliveryOTPExpiry < Date.now()) {
      return res.status(401).json({ message: "OTP has expired!" });
    }

    order.status = "delivered";
    await order.save();

    // Email to seller — delivered confirmation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.email, pass: process.env.pass },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: order.sellerEmail,
      subject: `Order Delivered — ${order.productTitle}`,
      html: `
        <h2>Your order has been delivered! 🎉</h2>
        <p><b>Product:</b> ${order.productTitle}</p>
        <p><b>Buyer:</b> ${order.buyerName}</p>
        <p><b>Amount:</b> ₹${order.totalAmount}</p>
        <p>The order has been successfully delivered and confirmed by the buyer.</p>
      `,
    });

    res.json({ success: true, message: "Order delivered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


