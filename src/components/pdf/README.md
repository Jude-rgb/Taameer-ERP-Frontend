# PDF Components

This folder contains PDF generation utilities for the application.

## Structure

- `generatePurchaseOrderPdf.ts` - Main PDF generation function for purchase orders
- `index.ts` - Export file for clean imports
- `README.md` - This documentation file

## Usage

```typescript
import { generatePurchaseOrderPDF, type PurchaseOrderDetails } from '@/components/pdf';

// Generate PDF for a purchase order
await generatePurchaseOrderPDF(purchaseOrderData, { withVAT: true });
```

## Features

- Professional PDF layout with company branding
- Automatic table generation with product details
- VAT calculation support
- Company logo integration
- Multi-page support for long documents
- Consistent styling and formatting

## Dependencies

- `jspdf` - Core PDF generation library
- `jspdf-autotable` - Table generation plugin for jsPDF
