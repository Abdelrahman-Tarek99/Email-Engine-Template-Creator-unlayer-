# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Unlayer Email Template Builder

A React-based email template builder using Unlayer's free version with advanced features including merge tags (variables), template management, and HTML export capabilities.

## Features

- 🎨 **Drag & Drop Email Editor** - Create beautiful email templates with Unlayer's intuitive interface
- 📝 **Merge Tags (Variables)** - Add dynamic content to your emails using variables like `{{first_name}}`, `{{company_name}}`, etc.
- 💾 **Template Management** - Save, load, duplicate, and manage multiple email templates
- 📤 **HTML Export** - Export templates with or without merge tags replaced
- 🧪 **Test Email Sending** - Send test emails to verify your templates
- 🖼️ **Image Handling** - Images are automatically converted to base64 for embedded email delivery

## Getting Started

### Installation

```bash
npm install
npm run dev
```

### Configuration

1. **Project ID**: Update the `projectId` in `src/EmailEditor.tsx` with your Unlayer project ID
2. **API Endpoint**: Implement the `/api/send-test-email` endpoint on your backend for test email functionality

## Merge Tags (Variables) Guide

### What are Merge Tags?

Merge tags are dynamic variables that you can insert into your email templates. They get replaced with actual values when the email is sent or exported.

### How to Use Merge Tags

1. **In the Editor**: 
   - Click on any text element in the email editor
   - You'll see a "Merge Tags" button in the text toolbar
   - Click it to insert variables like `{{first_name}}`, `{{company_name}}`, etc.

2. **Managing Merge Tags**:
   - Use the "Merge Tags (Variables)" section in the control panel
   - Add new tags with the "+ Add Merge Tag" button
   - Set sample values for testing
   - Remove tags you don't need

### Default Merge Tags

The application comes with these pre-configured merge tags:
- `{{first_name}}` - User's first name
- `{{last_name}}` - User's last name  
- `{{company_name}}` - Company name
- `{{user_email}}` - User's email address
- `{{unsubscribe_link}}` - Unsubscribe link

### Adding Custom Merge Tags

1. Click "+ Add Merge Tag" in the control panel
2. Enter the tag name (e.g., `product_name`)
3. Set a sample value for testing
4. The tag will be available in the editor as `{{product_name}}`

## HTML Export Process

### How HTML Export Works

When you export HTML from Unlayer, the process includes:

1. **Template Processing**: The email template is converted to HTML
2. **Merge Tag Replacement**: Variables are replaced with actual values (if provided)
3. **Image Processing**: Images are converted to base64 format for embedded delivery
4. **CSS Inlining**: Styles are inlined for email client compatibility

### Export Options

#### Export with Merge Tags Replaced
```javascript
editor.exportHtml((data) => {
  const html = data.html; // HTML with variables replaced
  const design = data.design; // Original design JSON
}, {
  mergeTags: {
    first_name: 'John',
    last_name: 'Doe',
    company_name: 'Your Company'
  }
});
```

#### Export with Merge Tags Preserved
```javascript
editor.exportHtml((data) => {
  const html = data.html; // HTML with {{first_name}} still in place
  const design = data.design; // Original design JSON
});
```

### Using the Export Button

1. Set up your merge tags in the control panel
2. Click "Export HTML with Variables" 
3. The HTML file will be downloaded with variables replaced by sample values
4. You can also use this HTML directly in your email sending system

## Image Handling

### How Images are Processed

1. **Upload**: When you upload an image in the editor, it's stored temporarily
2. **Base64 Conversion**: During HTML export, images are automatically converted to base64 format
3. **Embedded Delivery**: The base64 images are embedded directly in the HTML, ensuring they display in all email clients

### Benefits of Base64 Images

- ✅ **No External Dependencies**: Images don't rely on external URLs
- ✅ **Email Client Compatibility**: Works in all email clients including Outlook
- ✅ **Offline Viewing**: Recipients can view images even without internet
- ✅ **No Broken Links**: Images won't disappear if external servers go down

### Image Size Considerations

- Base64 encoding increases file size by ~33%
- Large images may make emails slower to load
- Consider optimizing images before uploading (recommended max: 1MB per image)

## Template Management

### Saving Templates

1. Design your email template in the editor
2. Enter a template name in the control panel
3. Click "Save Template" to store it locally
4. Templates are saved in browser localStorage

### Loading Templates

1. Click "📁 Manage Templates" to open the template manager
2. Browse your saved templates
3. Click "Load" to open a template in the editor
4. Click "Copy" to duplicate a template
5. Click "Delete" to remove a template

### Template Features

- **Auto-save**: Templates are automatically saved to localStorage
- **Version Control**: Each template has a unique ID and creation timestamp
- **Duplicate**: Create variations of existing templates
- **Export**: Download templates as HTML files

## Test Email Sending

### Setting Up Test Emails

1. **From Address**: Enter the sender email address
2. **To Addresses**: Enter recipient email addresses (separate multiple with commas)
3. **Merge Tags**: Set sample values for testing variables
4. **Send Test**: Click "Send Test Email" to send a test email

### Backend API Required

You need to implement the `/api/send-test-email` endpoint:

```javascript
// Example API endpoint
POST /api/send-test-email
{
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "html": "<html>...</html>",
  "subject": "Test Email",
  "mergeTags": {
    "first_name": "John",
    "company_name": "Your Company"
  }
}
```

## Advanced Usage

### Conditional Content

You can use merge tags for conditional content:

```html
{{#if products}}
  <p>You have {{products.length}} items in your cart.</p>
{{else}}
  <p>Your cart is empty.</p>
{{/if}}
```

### Loops

For repeated content:

```html
{{#each products}}
  <div>
    <h3>{{name}}</h3>
    <p>{{description}}</p>
    <span>${{price}}</span>
  </div>
{{/each}}
```

### Custom Merge Tag Data

When exporting or sending emails, provide your merge tag data:

```javascript
const mergeTagsData = {
  first_name: 'John',
  last_name: 'Doe',
  company_name: 'Acme Corp',
  products: [
    { name: 'Product 1', price: '$10' },
    { name: 'Product 2', price: '$20' }
  ]
};
```

## Troubleshooting

### Common Issues

1. **Merge tags not showing in editor**: Make sure you've added merge tags in the control panel
2. **Images not displaying**: Check that images are properly uploaded and converted to base64
3. **Template not saving**: Verify that localStorage is enabled in your browser
4. **Export not working**: Ensure you have proper permissions and the editor is loaded

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## API Reference

### EmailEditor Props

```typescript
interface EmailEditorProps {
  projectId: number; // Your Unlayer project ID
  onLoad?: () => void; // Called when editor loads
  options?: {
    mergeTags?: Record<string, MergeTagConfig>;
  };
}
```

### Merge Tag Configuration

```typescript
interface MergeTagConfig {
  name: string;
  value: string; // The tag format like "{{first_name}}"
  sample: string; // Sample value for testing
}
```

## License

This project is open source and available under the MIT License.
