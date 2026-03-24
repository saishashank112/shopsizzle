const fs = require('fs');

const mappings = [
  { file: 'PromotionsEngine.jsx', title: 'Coupons & Deals', desc: 'Create and manage promotional campaigns.' },
  { file: 'ReturnsManagement.jsx', title: 'Returns & Refunds', desc: 'Process customer returns flexibly.' },
  { file: 'ReviewModeration.jsx', title: 'Product Reviews', desc: 'Moderate customer feedback and ratings.' },
  { file: 'AdminSettings.jsx', title: 'Platform Settings', desc: 'Configure global store settings and layout.' },
  { file: 'NotificationsManagement.jsx', title: 'Notifications', desc: 'Manage automated alerts and broadcasts.' },
  { file: 'CatalogConfig.jsx', title: 'Catalog Configuration', desc: 'Design deep categories and product taxonomies.' }
];

mappings.forEach(m => {
  let content = fs.readFileSync('client/src/components/admin/' + m.file, 'utf8');
  if (content.includes('className="page-header"')) {
      console.log('Skipping ' + m.file);
      return;
  }
  
  const headerHtml = `
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>${m.title}</h2>
                        <p>${m.desc}</p>
                    </div>
                </div>
            </div>
`;

  // Insert just after the first <div ...> return wrapper
  // We'll regex search for the first return ( <div ...>
  content = content.replace(/(return\s*\(\s*<div[^>]*>)/, `$1\n${headerHtml}`);
  fs.writeFileSync('client/src/components/admin/' + m.file, content);
  console.log('Injected ' + m.file);
});
