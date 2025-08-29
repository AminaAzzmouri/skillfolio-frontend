## Purpose
Generic confirm modal used for destructive actions (e.g., delete).

## Props
- open (bool): show/hide
- title (string)
- message (string, optional)
- onCancel (fn)
- onConfirm (fn)

## Usage
<ConfirmDialog
  open={show}
  title="Delete certificate?"
  message="This action cannot be undone."
  onCancel={...}
  onConfirm={...}
/>

docs/pages/CertificateDetail.jsx.md
## Purpose
Certificate details and related projects view (future). Linked from lists.

## MVP Scope
- Display certificate metadata
- Link to downloadable file
- List projects linked to this certificate (click-through to project detail)

## Future Enhancements
- Edit from detail
- Breadcrumb back to list
- Share/print action
