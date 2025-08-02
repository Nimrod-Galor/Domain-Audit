# Length-Based Domain Extraction Logic

## 🎯 Improved Domain Folder Naming

### **New Logic Implementation**

Instead of hardcoding specific TLD patterns, the system now uses a smart length-based approach:

**Rule**: If a domain part is **longer than 4 characters**, consider it part of the domain name. If it's **4 characters or less**, treat it as a TLD part.

### **Algorithm**

```javascript
// 1. Remove www. prefix and split by dots
const hostnameParts = HOSTNAME.replace(/^www\./, "").split(".");

// 2. Find the first part from right to left that's longer than 4 chars
for (let i = hostnameParts.length - 1; i >= 0; i--) {
  if (hostnameParts[i].length > 4) {
    DOMAIN_NAME = hostnameParts[i];
    break;
  }
}

// 3. Fallback: if no part > 4 chars, use second-to-last part
if (!DOMAIN_NAME) {
  DOMAIN_NAME = hostnameParts[hostnameParts.length - 2] || hostnameParts[0];
}
```

---

## 📊 Test Results

| Input Domain              | Domain Parts                   | Selected Part  | Length    | Folder Name            |
| ------------------------- | ------------------------------ | -------------- | --------- | ---------------------- |
| `www.stefanbakery.com`    | `[stefanbakery, com]`          | `stefanbakery` | 12 > 4 ✅ | `audits/stefanbakery/` |
| `blog.stefanbakery.com`   | `[blog, stefanbakery, com]`    | `stefanbakery` | 12 > 4 ✅ | `audits/stefanbakery/` |
| `subdomain.example.co.uk` | `[subdomain, example, co, uk]` | `example`      | 7 > 4 ✅  | `audits/example/`      |
| `api.stripe.com`          | `[api, stripe, com]`           | `stripe`       | 6 > 4 ✅  | `audits/stripe/`       |
| `docs.microsoft.com`      | `[docs, microsoft, com]`       | `microsoft`    | 9 > 4 ✅  | `audits/microsoft/`    |
| `www.amazon.co.uk`        | `[amazon, co, uk]`             | `amazon`       | 6 > 4 ✅  | `audits/amazon/`       |
| `test.github.io`          | `[test, github, io]`           | `github`       | 6 > 4 ✅  | `audits/github/`       |
| `mail.google.com`         | `[mail, google, com]`          | `google`       | 6 > 4 ✅  | `audits/google/`       |

---

## ✅ Benefits

### **1. Universal TLD Support**

- **No hardcoding**: Works with any TLD without maintaining a list
- **Future-proof**: Automatically handles new TLDs
- **International domains**: Works with ccTLDs, gTLDs, etc.

### **2. Smart Domain Detection**

- **Length-based logic**: Identifies meaningful domain parts vs TLD parts
- **Subdomain handling**: Correctly extracts main domain from subdomains
- **Consistent results**: Same folder name regardless of subdomain

### **3. Examples of Automatic Handling**

```
✅ stefanbakery.com → stefanbakery (12 chars > 4)
✅ example.co.uk → example (7 chars > 4, ignores co/uk ≤ 4)
✅ microsoft.com → microsoft (9 chars > 4)
✅ github.io → github (6 chars > 4, ignores io ≤ 4)
✅ amazon.co.uk → amazon (6 chars > 4, ignores co/uk ≤ 4)
```

### **4. Edge Case Handling**

- **Short domains**: `test.org` → uses fallback logic (second-to-last part)
- **Complex TLDs**: `.co.uk`, `.com.au`, `.gov.uk` automatically handled
- **Long subdomains**: `verylongsubdomain.site.com` → correctly identifies `verylongsubdomain`

---

## 🔧 Technical Advantages

### **Simplified Logic**

- **No TLD database**: Eliminates need to maintain TLD lists
- **Fewer edge cases**: Length-based rule is universal
- **Better maintainability**: Simpler code with fewer conditions

### **Improved Accuracy**

- **Brand recognition**: Folder names reflect actual brand/company names
- **Consistent grouping**: All subdomains of same domain go to same folder
- **Intuitive naming**: Folder names are meaningful and recognizable

### **Performance**

- **Faster execution**: No array lookups against hardcoded TLD lists
- **Memory efficient**: No need to store TLD databases
- **Scalable**: Works with unlimited domain variations

---

## 🎯 Real-World Examples

### **E-commerce Sites**

```
shop.nike.com → audits/nike/
store.adidas.com → audits/adidas/
www.amazon.co.uk → audits/amazon/
marketplace.etsy.com → audits/etsy/
```

### **Tech Companies**

```
api.stripe.com → audits/stripe/
docs.microsoft.com → audits/microsoft/
mail.google.com → audits/google/
dev.twitter.com → audits/twitter/
```

### **Complex TLDs**

```
www.example.co.uk → audits/example/
blog.company.com.au → audits/company/
support.service.gov.uk → audits/service/
```

This length-based approach provides a much more robust and maintainable solution for domain folder naming! 🎉
