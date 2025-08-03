# TLD-Based Domain Folder Naming Logic

## 🎯 Enhanced Domain Folder Naming with TLD Support

### **New TLD-Based Logic Implementation**

The system now uses a TLD-aware approach that includes the Top-Level Domain (TLD) in the folder naming structure for better organization and uniqueness.

### **Algorithm**

```javascript
export function extractMainDomain(hostname) {
  const parts = hostname.replace(/^www\./, "").split(".");

  // If it's a standard domain (e.g., example.com, blog.example.com)
  if (parts.length >= 2) {
    const tld = parts[parts.length - 1]; // e.g., com, org, co.uk
    const domain = parts[parts.length - 2]; // e.g., example, google

    // For subdomains, include subdomain, domain, and TLD
    if (parts.length > 2) {
      const subdomain = parts[0]; // e.g., blog, api, shop
      return `${subdomain}-${domain}-${tld}`; // e.g., blog-example-com
    }

    // For regular domains, use domain and TLD
    return `${domain}-${tld}`; // e.g., example-com, google-org
  }

  // Fallback to first part if something unusual
  return parts[0];
}
```

---

## 📊 Test Results & Examples

| Input Domain              | Domain Parts                   | Folder Name             | Benefits                 |
| ------------------------- | ------------------------------ | ----------------------- | ------------------------ |
| `www.stefanbakery.com`    | `[stefanbakery, com]`          | `stefanbakery-com`      | Clear TLD identification |
| `blog.stefanbakery.com`   | `[blog, stefanbakery, com]`    | `blog-stefanbakery-com` | Subdomain preserved      |
| `subdomain.example.co.uk` | `[subdomain, example, co, uk]` | `subdomain-example-uk`  | Complex TLD handled      |
| `api.stripe.com`          | `[api, stripe, com]`           | `api-stripe-com`        | API subdomain clear      |
| `shop.amazon.com`         | `[shop, amazon, com]`          | `shop-amazon-com`       | Service differentiation  |
| `google.org`              | `[google, org]`                | `google-org`            | Non-profit TLD clear     |
| `example.co.uk`           | `[example, co, uk]`            | `example-uk`            | Country TLD simplified   |
| `test.local`              | `[test, local]`                | `test-local`            | Local domain support     |

---

## 🚀 Advantages of TLD-Based Approach

### **1. Unique Identification**

- **Before**: `stefanbakery` (ambiguous TLD)
- **After**: `stefanbakery-com` (clear it's a .com domain)

### **2. Subdomain Preservation**

- **Before**: `blog-stefanbakery` (loses TLD info)
- **After**: `blog-stefanbakery-com` (complete domain structure)

### **3. TLD Differentiation**

- `example-com` vs `example-org` vs `example-net`
- Prevents folder conflicts for same domain with different TLDs

### **4. International Domain Support**

- `example-co-uk`, `example-com-au`, `example-de`
- Better handling of country-specific TLDs

### **5. Service Clarity**

- `api-service-com` vs `www-service-com` vs `shop-service-com`
- Clear distinction between different services/subdomains

---

## 💼 Real-World Use Cases

### **E-commerce Sites**

- `shop.amazon.com` → `shop-amazon-com`
- `api.amazon.com` → `api-amazon-com`
- `aws.amazon.com` → `aws-amazon-com`

### **International Businesses**

- `google.com` → `google-com`
- `google.co.uk` → `google-uk`
- `google.de` → `google-de`

### **Development Environments**

- `dev.example.com` → `dev-example-com`
- `staging.example.com` → `staging-example-com`
- `api.example.com` → `api-example-com`

---

## 🔧 Migration Benefits

1. **Better Organization**: Folders are now more descriptive and unique
2. **Conflict Prevention**: No more conflicts between same domain with different TLDs
3. **Subdomain Clarity**: Full subdomain structure preserved in folder names
4. **International Support**: Better handling of country and international TLDs
5. **Service Differentiation**: Clear distinction between different services/APIs

This TLD-based approach provides a much more robust and internationally-aware solution for domain folder naming! 🎉

---

## 📁 Folder Structure Examples

```
audits/
├── stefanbakery-com/
│   ├── audit-20250803-143022/
│   └── audit-20250803-150145/
├── blog-stefanbakery-com/
│   └── audit-20250803-151234/
├── api-stripe-com/
│   └── audit-20250803-152345/
├── google-com/
│   └── audit-20250803-153456/
├── google-org/
│   └── audit-20250803-154567/
└── example-co-uk/
    └── audit-20250803-155678/
```

Each domain gets its own clearly identified folder with TLD information preserved! 🎯
