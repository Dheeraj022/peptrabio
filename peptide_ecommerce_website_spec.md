# Peptide E-Commerce Website — Complete Product & Development Specification

## 1. Project Overview

Build a modern, premium e-commerce website for a **research-peptide business** using:

- **Frontend:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Font:** Orbitron
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage for product images and documents
- **Icons:** Lucide React
- **Deployment:** Vercel recommended
- **Admin:** Protected admin dashboard for product/catalog management

The website should feel **premium, scientific, futuristic, clean, and trustworthy**, while remaining simple to navigate.

> **Important compliance direction:** The site must be designed and configured as a **research-use-only catalog/store**. Do not present products as medicines, supplements, treatments, or human-use products. Do not create human dosing instructions, injection instructions, therapeutic recommendations, disease-treatment claims, or other content that encourages human use. Product descriptions and claims should be limited to verified research/catalog information supplied by the business and reviewed for applicable laws and regulations.

---

# 2. Reference Files

Two visual/source references are supplied with this specification.

### Product-page HTML reference

The attached HTML provides the structural reference for the product detail page. It contains:

- Sticky navigation
- Top announcement bar
- Breadcrumb navigation
- Two-column product hero
- Product image/vial presentation
- Product badges
- Product title, description, price and CTA
- Product specification cards
- Trust/quality strip
- Tabbed product information
- Specification tables
- Research/reference sections
- Storage/research information areas
- Quality-assurance cards
- Sidebar cards
- Research-use-only disclaimer
- Footer policy links

The original reference uses a green scientific visual system, but the new website should replace that visual system with the **purple/white palette from the supplied screenshot** while preserving the useful layout structure. The reference product page specifically demonstrates the product hero, badges, pricing, specification cards, CTA area, tab navigation and sidebar structure. fileciteturn0file0L41-L82

The reference also demonstrates the overall information architecture of the product detail content and sidebar. fileciteturn0file0L105-L120 fileciteturn0file0L520-L552

### Color reference screenshot

The supplied screenshot establishes the primary visual direction:

- Strong purple CTA
- White/light background
- Very subtle grid pattern
- Rounded pill-shaped button
- White futuristic typography
- Minimal, modern interface

The dominant purple sampled from the supplied screenshot is approximately:

**Primary Purple: `#672CAE`**

Use this as the main brand/CTA color.

---

# 3. Design Direction

## Brand Personality

The website should communicate:

- Scientific
- Premium
- Futuristic
- Minimal
- Technical
- Clean
- Reliable
- Research-oriented

Avoid:

- Cheap-looking pharmacy aesthetics
- Excessive gradients
- Generic AI-generated visuals
- Overly colorful UI
- Heavy shadows
- Cartoon illustrations
- Medical-treatment advertising
- Claims of guaranteed biological or therapeutic outcomes

---

# 4. Color System

Use CSS variables/Tailwind theme tokens so colors can be changed globally.

```text
Primary Purple:        #672CAE
Primary Purple Hover:  #57239A
Light Purple:          #F2EAFA
Very Light Purple:     #FAF8FD

Background:            #FFFFFF
Soft Background:       #FAFAFC
Surface:               #FFFFFF

Text Primary:          #111111
Text Secondary:        #5F5F6B
Text Muted:            #858591

Border:                #E7E2EC
Border Strong:         #D7CDE1

Success:               #2E7D5B
Warning:               #B7791F
Danger:                #B42318

Grid Line:             rgba(103,44,174,0.045)
```

## Background

The main website background should be white or near-white.

Add an extremely subtle technical grid:

```css
background-image:
  linear-gradient(rgba(103,44,174,0.035) 1px, transparent 1px),
  linear-gradient(90deg, rgba(103,44,174,0.035) 1px, transparent 1px);
background-size: 32px 32px;
```

Do not make the grid visually dominant.

---

# 5. Typography

Use **Orbitron as the primary website font**.

Recommended setup:

```tsx
import { Orbitron } from "next/font/google";

export const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});
```

Use Orbitron for:

- Logo
- Navigation
- Headings
- Buttons
- Prices
- Product names
- Product codes
- Technical labels
- Admin dashboard headings

For longer paragraphs, Orbitron can become difficult to read. Use a highly readable secondary font for body copy if required, while keeping Orbitron dominant across the visual identity.

Suggested secondary font:

- Inter
- Geist Sans

Example:

```text
Headings: Orbitron
UI labels: Orbitron
Buttons: Orbitron
Body: Inter/Geist Sans
Technical values: Orbitron
```

---

# 6. Website Structure

The main navigation should contain:

1. Home
2. Shop
3. About
4. Contact
5. Policies

Recommended desktop navigation:

```text
[LOGO]     Home   Shop   About   Contact   Policies     [Cart]
```

Optional utility links:

- COA / Documentation
- Research Information
- Account

The navigation should be sticky.

---

# 7. Required Public Pages

Create the following routes:

```text
/
 /shop
 /shop/[slug]
 /about
 /contact
 /cart
 /checkout

 /policies
 /policies/privacy
 /policies/terms
 /policies/shipping
 /policies/returns
 /policies/refund
 /policies/research-use
 /policies/disclaimer
 /policies/cookie
```

Additional pages may be added later.

---

# 8. Home Page

The homepage should be designed as a premium scientific landing page.

## Section 1 — Announcement Bar

Example:

```text
RESEARCH USE ONLY • PREMIUM RESEARCH MATERIALS • DOCUMENTATION AVAILABLE
```

Keep the announcement concise.

Do not make unsupported claims such as guaranteed purity, guaranteed effects, or regulatory approval.

---

## Section 2 — Hero

Suggested structure:

```text
ADVANCED RESEARCH MATERIALS

Precision. Documentation. Research.

Explore a curated catalog of research-use products
with clear specifications and batch documentation.

[ SHOP PRODUCTS ]
[ LEARN MORE ]
```

Hero visual:

- Futuristic peptide/vial imagery
- Scientific molecular elements
- Purple glow
- White background
- Very subtle grid
- Clean product photography
- No human medical imagery

---

# 9. Homepage Product Section

Heading:

```text
FEATURED RESEARCH PRODUCTS
```

Display a responsive product grid.

Desktop:

```text
4 cards per row
```

Tablet:

```text
2 cards per row
```

Mobile:

```text
1 card per row
```

Each product card should contain:

- Product image
- Product name
- Category
- Size
- Purity/specification field if verified
- Price
- Stock status
- View Product button
- Add to Cart button

Example:

```text
[ PRODUCT IMAGE ]

SELANK
RESEARCH PEPTIDE
5 MG

99%+ PURITY
$68.00

[ VIEW PRODUCT ]
```

Only show product information that exists in the database.

---

# 10. Product Detail Page

The attached HTML should be treated as the main structural reference.

The reference product page uses a two-column hero with product media on the left and product information/CTA on the right. fileciteturn0file0L219-L283

Implement the new version using React components instead of static HTML.

## Recommended component structure

```text
ProductPage
 ├── AnnouncementBar
 ├── Navbar
 ├── Breadcrumbs
 ├── ProductHero
 │    ├── ProductGallery
 │    ├── ProductBadges
 │    ├── ProductInfo
 │    ├── ProductPrice
 │    ├── QuantitySelector
 │    ├── AddToCart
 │    └── ResearchUseNotice
 ├── ProductTrustStrip
 ├── ProductDetails
 │    ├── Overview
 │    ├── Specifications
 │    ├── Research Information
 │    ├── Quality / Documentation
 │    └── References
 ├── RelatedProducts
 ├── ProductDisclaimer
 └── Footer
```

The reference also contains quick specifications for items such as molecular weight, CAS number, sequence and charge. These should become **dynamic database fields**, not hardcoded content. fileciteturn0file0L264-L282

---

# 11. Product Page Tabs

Recommended tabs:

```text
Overview
Specifications
Research Information
Quality & Documentation
References
```

Avoid publishing unsupported medical or therapeutic claims.

The original reference demonstrates a tabbed information architecture that can be retained in the new implementation. fileciteturn0file0L306-L317

### Overview

Show:

- Short product description
- Research classification
- Product format
- Available size
- Verified catalog specifications

### Specifications

Dynamic table:

```text
Property          Value
--------------------------------
Product Name      ...
Product Code      ...
CAS Number        ...
Sequence          ...
Molecular Weight  ...
Purity            ...
Format            ...
Vial Size         ...
Storage           ...
```

### Research Information

Display business-approved scientific information.

Use neutral wording:

```text
Research information only.
No human-use or therapeutic claims.
```

### Quality & Documentation

Display:

- COA availability
- Batch number
- Testing documentation
- Analytical method
- Date
- Download/view COA button

### References

Optional scientific references.

References should be entered through the admin dashboard or stored in the database.

---

# 12. Product Data Model

Use Supabase PostgreSQL.

## products table

```sql
create table products (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text unique not null,

  short_description text,
  description text,

  category text,
  product_code text,

  cas_number text,
  sequence text,
  molecular_formula text,
  molecular_weight numeric,

  purity text,
  size text,
  format text,

  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),

  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,

  research_use_only boolean not null default true,

  storage_information text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 13. Product Images

Create a separate table:

```sql
create table product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid references products(id) on delete cascade,

  image_url text not null,
  alt_text text,

  sort_order integer default 0,

  created_at timestamptz default now()
);
```

Allow admins to:

- Upload image
- Delete image
- Reorder images
- Set primary image

---

# 14. Product Documentation / COA

Create:

```sql
create table product_documents (
  id uuid primary key default gen_random_uuid(),

  product_id uuid references products(id) on delete cascade,

  title text not null,
  document_type text not null,
  file_url text not null,

  is_public boolean default false,

  created_at timestamptz default now()
);
```

Possible document types:

```text
COA
SDS
Specification Sheet
Research Reference
Other
```

Only make documents public when the business has explicitly approved them.

---

# 15. Product References

```sql
create table product_references (
  id uuid primary key default gen_random_uuid(),

  product_id uuid references products(id) on delete cascade,

  title text not null,
  authors text,
  publication text,
  year integer,
  url text,

  created_at timestamptz default now()
);
```

---

# 16. Product Categories

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text unique not null,
  description text,

  is_active boolean default true,

  created_at timestamptz default now()
);
```

Products should reference category IDs rather than relying exclusively on free-form category text.

---

# 17. Admin Authentication

Use **Supabase Auth**.

Admin route:

```text
/admin/login
```

Protected dashboard:

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders
/admin/settings
```

Only authenticated users with an admin role may access the dashboard.

---

# 18. Admin Role System

Create:

```sql
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,

  role text not null default 'admin',

  created_at timestamptz default now()
);
```

Roles:

```text
admin
editor
```

Permissions:

### Admin

- Create product
- View product
- Edit product
- Delete product
- Upload images
- Upload documents
- Manage stock
- Manage categories
- Manage orders
- Manage settings

### Editor

- Create product
- Edit product
- Upload product media
- Cannot delete admin accounts
- Cannot modify critical system settings

---

# 19. Admin Product Dashboard

The admin product list should look like:

```text
PRODUCTS

[ + Add Product ]

Search products...
Filter: Category
Filter: Status
Sort: Newest

------------------------------------------------
Product       Category     Price    Stock  Status
------------------------------------------------
Selank        Peptide      $68      20     Active
Product 2     Peptide      $75      10     Active
Product 3     Research     $90      0      Draft
------------------------------------------------
```

Each row:

```text
Edit
Duplicate
Deactivate
Delete
```

Delete should require confirmation.

---

# 20. Add Product Page

Fields:

### Basic Information

```text
Product Name *
Slug *
Product Code
Category *
Short Description
Full Description
```

### Product Specifications

```text
CAS Number
Sequence
Molecular Formula
Molecular Weight
Purity
Size
Format
Storage Information
```

### Commerce

```text
Price *
Compare-at Price
Stock Quantity *
Active
Featured
```

### Media

```text
Upload Product Images
Set Primary Image
```

### Documentation

```text
COA
SDS
Specification Sheet
Research References
```

### Compliance

```text
Research Use Only: YES
Human Use Claims: NOT ALLOWED
```

The UI should reinforce the compliance rules rather than allowing unrestricted marketing copy.

---

# 21. Edit Product

Admin should be able to edit every editable product field.

Requirements:

- Pre-populate existing data
- Image management
- Document management
- Save draft
- Publish
- Deactivate
- Delete

Show a success toast:

```text
Product updated successfully.
```

---

# 22. Delete Product

Never immediately delete without confirmation.

Modal:

```text
Delete Product?

This action cannot be undone.

[ Cancel ] [ Delete Product ]
```

Recommended approach:

- Soft delete / deactivate for normal admin workflow
- Permanent deletion only for authorized admins

---

# 23. Inventory

Basic inventory should be supported.

Fields:

```text
stock_quantity
is_active
```

States:

```text
In Stock
Low Stock
Out of Stock
Unavailable
```

Never allow customers to purchase a product that is inactive or unavailable.

---

# 24. Cart

Cart should support:

- Add product
- Remove product
- Increase quantity
- Decrease quantity
- Product subtotal
- Cart total
- Empty cart
- Persist cart during session

Example:

```text
YOUR CART

Selank 5mg
Qty: 2
$136.00

Subtotal: $136.00

[ CHECKOUT ]
```

---

# 25. Checkout

Checkout should collect only information necessary for the business's lawful order fulfillment.

Typical fields:

```text
First Name
Last Name
Email
Phone
Billing Address
Shipping Address
Country
State
City
Postal Code
```

Include an explicit checkbox:

```text
I acknowledge that these products are sold for research use only and
agree to the Research Use Policy.
```

The checkout should block submission unless required compliance acknowledgements are accepted.

Do not include fields or copy encouraging human administration or treatment.

---

# 26. Orders Database

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references auth.users(id),

  status text not null default 'pending',

  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  customer_email text not null,

  shipping_address jsonb,
  billing_address jsonb,

  compliance_acknowledged boolean not null default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Order statuses:

```text
pending
paid
processing
shipped
delivered
cancelled
refunded
```

---

# 27. Order Items

```sql
create table order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),

  product_name text not null,
  product_code text,

  quantity integer not null,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) not null
);
```

Store product name and price snapshots so historical orders remain accurate even if the product changes later.

---

# 28. Supabase Storage

Create buckets:

```text
product-images
product-documents
```

Recommended permissions:

### product-images

Public read, authenticated admin upload/delete.

### product-documents

Private by default.

Generate signed URLs for protected documents when required.

---

# 29. Supabase Row Level Security

Enable RLS on all application tables.

Public users:

```text
Can read active products
Can read active categories
Can read public product images
Can read explicitly public documentation
```

Admins:

```text
Full product CRUD
Full category CRUD
Media management
Documentation management
Order management
```

Never expose the Supabase service-role key to the browser.

Use:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The service role key must exist only on the server.

---

# 30. Next.js Folder Structure

Recommended:

```text
src/
├── app/
│   ├── page.tsx
│   ├── shop/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   ├── contact/
│   │   └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── policies/
│   │   ├── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── shipping/
│   │   │   └── page.tsx
│   │   ├── returns/
│   │   │   └── page.tsx
│   │   ├── refund/
│   │   │   └── page.tsx
│   │   ├── research-use/
│   │   │   └── page.tsx
│   │   ├── disclaimer/
│   │   │   └── page.tsx
│   │   └── cookie/
│   │       └── page.tsx
│   │
│   └── admin/
│       ├── login/
│       │   └── page.tsx
│       ├── page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx
│       └── orders/
│           └── page.tsx
│
├── components/
│   ├── layout/
│   ├── navbar/
│   ├── footer/
│   ├── home/
│   ├── shop/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── validations/
│   └── utils/
│
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── admin.ts
│
└── middleware.ts
```

---

# 31. Tailwind Configuration

Create brand tokens:

```ts
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: "#672CAE",
        dark: "#57239A",
        light: "#F2EAFA",
      },
    },
    fontFamily: {
      orbitron: ["var(--font-orbitron)"],
    },
  },
}
```

Usage:

```tsx
<button className="bg-brand hover:bg-brand-dark font-orbitron">
  SHOP NOW
</button>
```

---

# 32. Button Design

The supplied screenshot shows a rounded purple CTA with white futuristic text.

Primary button:

```text
Background: #672CAE
Text: White
Border radius: 9999px
Font: Orbitron
Font weight: 500–600
Padding: 14px 30px
```

Hover:

```text
Slightly darker purple
Small upward movement
Very subtle purple shadow
```

Do not overuse animations.

---

# 33. Cards

Product cards:

```text
Background: #FFFFFF
Border: #E7E2EC
Border radius: 18px
```

Hover:

```text
Border becomes purple
translateY(-2px)
subtle shadow
```

Keep the card layout spacious.

---

# 34. Product Image Style

Use realistic, professional product photography.

Preferred:

- White background
- Purple accent lighting
- Clean vial/bottle presentation
- Sharp edges
- High resolution
- Consistent camera angle

Do not generate misleading packaging or false certifications.

---

# 35. Responsive Design

Breakpoints:

```text
Mobile: < 640px
Tablet: 640px–1024px
Desktop: > 1024px
Large desktop: > 1280px
```

Mobile navigation:

```text
[LOGO]                         [MENU]
```

Menu should open as a full-height drawer.

Product page on mobile:

```text
Product image
Product title
Price
CTA
Specifications
Research information
Related products
Disclaimer
```

The sidebar should move below the primary product information.

---

# 36. SEO

Every product needs dynamic metadata.

Example:

```ts
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | Research Products`,
    description: product.short_description,
  };
}
```

Do not put therapeutic claims into SEO titles/descriptions.

Use:

- Product schema where appropriate
- Organization schema
- Breadcrumb schema
- Canonical URLs
- Open Graph metadata
- Twitter/X metadata
- Sitemap
- Robots.txt

---

# 37. Security Requirements

Mandatory:

- Supabase RLS
- Server-side authorization
- Protected admin routes
- No service key in client
- Validate all form inputs
- Sanitize rich text
- Validate uploaded file types
- Validate uploaded file sizes
- Rate-limit sensitive endpoints
- CSRF-safe architecture where applicable
- Secure cookies
- HTTPS
- Audit admin actions where practical

Never trust values sent from the browser.

---

# 38. Admin Audit Log

Recommended table:

```sql
create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),

  admin_id uuid references auth.users(id),

  action text not null,
  entity_type text,
  entity_id uuid,

  metadata jsonb,

  created_at timestamptz default now()
);
```

Actions:

```text
product_created
product_updated
product_deleted
product_activated
product_deactivated
document_uploaded
document_deleted
order_status_updated
```

---

# 39. Contact Page

Contact page should contain:

```text
CONTACT US

Questions about products, documentation or orders?

Name
Email
Subject
Message

[ SEND MESSAGE ]
```

Add:

- Business email
- Business hours
- Address if the business chooses to publish it
- Research documentation contact

Do not provide medical consultation language.

---

# 40. About Page

Suggested sections:

### About the Company

Describe:

- Research-focused catalog
- Quality/documentation philosophy
- Product sourcing
- Transparency
- Customer support

### Our Standards

Cards:

```text
DOCUMENTATION
Clear product information

TRACEABILITY
Batch-level records where available

TRANSPARENCY
Straightforward catalog information

RESEARCH FOCUS
Products presented for legitimate research use
```

Only make claims that the company can substantiate.

---

# 41. Policies

Create a dedicated Policies landing page.

Cards:

```text
Privacy Policy
Terms & Conditions
Shipping Policy
Return Policy
Refund Policy
Research Use Policy
Disclaimer
Cookie Policy
```

Each policy must have its own page.

Policy content should be reviewed by qualified legal counsel and adapted to the jurisdictions where the business operates.

Do not hardcode legal claims that have not been reviewed.

---

# 42. Research Use Policy

This should be highly visible.

Core concept:

```text
Products are intended solely for legitimate research purposes
and must not be marketed or represented as products for human
consumption, diagnosis, treatment, prevention or supplementation.
```

Do not include instructions for self-administration.

The reference page itself prominently labels the product as research-use-only and says it is not approved for human use; preserve this general compliance-oriented structure while rewriting the actual policy for the business and applicable jurisdiction. fileciteturn0file0L549-L557

---

# 43. Product Content Rules

Every product should pass these rules before publication.

Allowed:

- Product name
- Chemical/product identifiers
- Verified specifications
- Batch information
- Documentation
- Research references
- Neutral scientific descriptions
- Storage information when legally appropriate
- Research-use classification

Do not publish:

- Human dosing
- Injection instructions
- Self-administration instructions
- Treatment protocols
- Claims to cure diseases
- Claims to treat medical conditions
- Before/after medical promises
- Guaranteed outcomes
- Instructions intended to facilitate human use

---

# 44. Product Status

Use:

```text
Draft
Active
Inactive
Out of Stock
```

Draft products must not appear publicly.

Inactive products should return a controlled unavailable state rather than exposing stale purchasing functionality.

---

# 45. Search and Filters

Shop page should support:

```text
Search
Category
Availability
Price range
Featured
```

Sort:

```text
Newest
Price: Low to High
Price: High to Low
Name A-Z
```

Use URL query parameters:

```text
/shop?q=selank&category=peptides&sort=price-asc
```

This improves shareability and SEO.

---

# 46. Loading States

Use skeleton loaders.

Product card:

```text
Image skeleton
Title skeleton
Price skeleton
Button skeleton
```

Product detail:

```text
Image skeleton
Title skeleton
Specification skeleton
```

---

# 47. Error States

Create:

```text
404 Product Not Found
Product Unavailable
Checkout Error
Payment Error
Admin Unauthorized
Server Error
```

Example:

```text
PRODUCT UNAVAILABLE

This research product is currently unavailable.

[ RETURN TO SHOP ]
```

---

# 48. Empty States

Shop:

```text
NO PRODUCTS FOUND

Try changing your search or filters.
```

Cart:

```text
YOUR CART IS EMPTY

Explore our research catalog.

[ SHOP PRODUCTS ]
```

Admin:

```text
NO PRODUCTS YET

Add your first product to begin building the catalog.

[ + ADD PRODUCT ]
```

---

# 49. Accessibility

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Alt text for images
- Accessible dialogs
- Accessible mobile menu
- Sufficient contrast
- ARIA only where necessary
- Buttons should not be implemented as plain divs

---

# 50. Performance

Use:

- Next.js Image
- Responsive image sizes
- Lazy loading
- Server Components where possible
- Dynamic imports for heavy client components
- Minimal JavaScript
- Optimized fonts
- CDN-backed image delivery
- Cached public product queries

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

---

# 51. State Management

Keep architecture simple.

Use:

- React Server Components for server-rendered data
- URL parameters for shop filters
- React state for simple UI
- Context or a lightweight store for cart state if needed

Do not introduce Redux unless the application genuinely requires it.

---

# 52. Validation

Use Zod for forms.

Example:

```ts
const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().nonnegative(),
  stock_quantity: z.number().int().nonnegative(),
});
```

Validate on:

1. Client
2. Server

Server validation is mandatory.

---

# 53. Recommended UI Components

Create reusable components:

```text
Button
Input
Textarea
Select
Modal
Drawer
Badge
Card
Table
Pagination
Dropdown
Tabs
Toast
Alert
Skeleton
Breadcrumb
FileUploader
ImageUploader
Price
ProductCard
ProductGallery
```

Use one design system throughout the website.

---

# 54. Product Card Component

Example interface:

```ts
type ProductCardProps = {
  product: Product;
};
```

Display:

```text
image
name
category
size
price
availability
CTA
```

Never hardcode product names or prices.

---

# 55. Product Page Component

Example:

```tsx
<ProductHero product={product} />

<ProductTrustSection product={product} />

<ProductTabs
  overview={product.description}
  specifications={product.specifications}
  research={product.research}
  documentation={product.documents}
  references={product.references}
/>

<RelatedProducts products={relatedProducts} />
```

---

# 56. Admin Product CRUD API

Preferred server-side actions:

```text
createProduct()
updateProduct()
deleteProduct()
toggleProductStatus()
uploadProductImage()
deleteProductImage()
uploadProductDocument()
deleteProductDocument()
```

Use Next.js Server Actions or secure route handlers.

Do not expose unrestricted database CRUD directly to the browser.

---

# 57. Admin Dashboard Overview

Dashboard cards:

```text
TOTAL PRODUCTS
ACTIVE PRODUCTS
OUT OF STOCK
TOTAL ORDERS
PENDING ORDERS
```

Optional:

```text
Recent Orders
Recently Updated Products
Low Stock Products
```

---

# 58. Admin Navigation

```text
Dashboard
Products
Categories
Orders
Documents
Settings
Admin Users
Audit Logs
Logout
```

On mobile use a drawer.

---

# 59. Product Editor UX

The product editor should be divided into cards:

```text
1. Basic Information
2. Product Details
3. Specifications
4. Pricing & Inventory
5. Images
6. Documents
7. References
8. Compliance
9. Publish
```

Sticky action bar:

```text
[ Save Draft ] [ Preview ] [ Publish ]
```

---

# 60. Preview

Admin should be able to preview a product before publication.

Route:

```text
/admin/products/[id]/preview
```

Preview should use the same public product component.

Draft products must remain inaccessible to normal visitors.

---

# 61. Environment Variables

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_CURRENCY=USD
```

Never commit `.env.local`.

---

# 62. Database Migrations

Use Supabase migrations.

Recommended sequence:

```text
001_create_categories.sql
002_create_products.sql
003_create_product_images.sql
004_create_product_documents.sql
005_create_product_references.sql
006_create_orders.sql
007_create_order_items.sql
008_create_admin_users.sql
009_create_audit_logs.sql
010_enable_rls.sql
```

---

# 63. Seed Data

Create development seed data for 3–5 products.

Use clearly fictional/test data unless the business has provided verified product information.

Example:

```text
Demo Research Product A
Demo Research Product B
Demo Research Product C
```

Do not seed unsupported scientific claims.

---

# 64. Testing

### Unit tests

Test:

- Product validation
- Price calculations
- Cart calculations
- Stock validation
- Slug generation

### Integration tests

Test:

- Product creation
- Product editing
- Product deletion
- Admin authentication
- RLS
- Image uploads
- Document permissions

### E2E tests

Test:

```text
Visitor → Shop → Product → Cart → Checkout
Admin → Login → Products → Add → Edit → Delete
```

---

# 65. Security Test Cases

Verify:

```text
Unauthenticated user cannot access /admin
Editor cannot perform restricted admin operations
Normal user cannot modify products
Public user cannot access private documents
Inactive products cannot be purchased
Draft products are not publicly visible
Service-role key is never sent to browser
```

---

# 66. Final User Experience

The intended journey:

```text
HOME
  ↓
SHOP
  ↓
PRODUCT
  ↓
REVIEW INFORMATION
  ↓
ADD TO CART
  ↓
CART
  ↓
CHECKOUT
  ↓
RESEARCH-USE ACKNOWLEDGEMENT
  ↓
ORDER
```

Admin journey:

```text
ADMIN LOGIN
  ↓
DASHBOARD
  ↓
PRODUCTS
  ↓
ADD / EDIT / DELETE
  ↓
UPLOAD IMAGES / DOCUMENTS
  ↓
PUBLISH
  ↓
PUBLIC SHOP
```

---

# 67. Definition of Done

The project is complete when:

### Frontend

- [ ] Next.js App Router implemented
- [ ] TypeScript enabled
- [ ] Tailwind CSS configured
- [ ] Orbitron implemented
- [ ] Purple/white design implemented
- [ ] Responsive desktop/tablet/mobile layouts
- [ ] Subtle grid background implemented
- [ ] Home page completed
- [ ] Shop page completed
- [ ] Product page completed
- [ ] About page completed
- [ ] Contact page completed
- [ ] Cart completed
- [ ] Checkout completed
- [ ] All policy pages completed

### Product System

- [ ] Products stored in Supabase
- [ ] Dynamic product pages
- [ ] Dynamic pricing
- [ ] Dynamic inventory
- [ ] Product categories
- [ ] Product images
- [ ] Product documents
- [ ] Product references
- [ ] Search and filters

### Admin

- [ ] Supabase authentication
- [ ] Protected admin routes
- [ ] Product list
- [ ] Add product
- [ ] Edit product
- [ ] Delete/deactivate product
- [ ] Image upload
- [ ] Document upload
- [ ] Category management
- [ ] Inventory management
- [ ] Order management
- [ ] Audit logging

### Security

- [ ] RLS enabled
- [ ] Server-side authorization
- [ ] Service role key protected
- [ ] Upload validation
- [ ] Form validation
- [ ] Admin permissions tested

### Compliance

- [ ] Research-use-only positioning
- [ ] No human dosing instructions
- [ ] No self-administration instructions
- [ ] No unsupported treatment claims
- [ ] Research-use acknowledgement at checkout
- [ ] Disclaimer visible
- [ ] Policies reviewed for applicable jurisdiction

---

# 68. Recommended Build Order

Implement in this order:

## Phase 1 — Foundation

1. Create Next.js project
2. Configure TypeScript
3. Configure Tailwind
4. Add Orbitron
5. Create global design tokens
6. Create layout
7. Create navbar/footer
8. Create responsive grid background

## Phase 2 — Supabase

1. Create Supabase project
2. Create database
3. Run migrations
4. Configure RLS
5. Configure Storage
6. Configure Auth
7. Create admin role system

## Phase 3 — Public Website

1. Home
2. Shop
3. Product detail
4. About
5. Contact
6. Policies
7. Cart
8. Checkout

## Phase 4 — Admin

1. Admin login
2. Dashboard
3. Product list
4. Add product
5. Edit product
6. Delete/deactivate product
7. Image management
8. Document management
9. Category management
10. Order management

## Phase 5 — Quality

1. Responsive testing
2. Accessibility testing
3. SEO
4. Security testing
5. RLS testing
6. Performance optimization
7. Production deployment

---

# 69. Visual Target

The final site should look like a combination of:

```text
Scientific laboratory
        +
Luxury technology brand
        +
Modern SaaS interface
        +
Premium e-commerce
```

Primary visual characteristics:

```text
WHITE SPACE
+
PURPLE ACCENTS
+
ORBITRON TYPOGRAPHY
+
SUBTLE GRID
+
ROUNDED CARDS
+
CLEAN PRODUCT PHOTOGRAPHY
+
MINIMAL SHADOWS
+
PREMIUM MICRO-INTERACTIONS
```

The supplied product HTML should be used as a **layout/UX reference**, not copied as static HTML. Its product hero, specification, trust, tab, sidebar and research-information patterns are useful building blocks. fileciteturn0file0L219-L283

The final implementation should convert those patterns into reusable Next.js components connected to Supabase so the administrator can manage the catalog without editing code.
