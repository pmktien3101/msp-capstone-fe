# Pagination Component

Reusable pagination component for displaying and navigating through paginated data.

## Features

- 🎯 Smart page number display with ellipsis for large page counts
- 📱 Responsive design (mobile-friendly)
- ♿ Accessible (ARIA labels and keyboard navigation)
- 🎨 Customizable styling with orange theme
- 📊 Optional information display (showing X-Y of Z items)
- ⚙️ Configurable maximum page buttons

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPage` | `number` | ✅ | - | Current active page (1-indexed) |
| `totalPages` | `number` | ✅ | - | Total number of pages |
| `totalItems` | `number` | ✅ | - | Total number of items across all pages |
| `itemsPerPage` | `number` | ✅ | - | Number of items per page |
| `onPageChange` | `(page: number) => void` | ✅ | - | Callback when page changes |
| `showInfo` | `boolean` | ❌ | `true` | Show/hide the "Showing X-Y of Z" text |
| `maxPageButtons` | `number` | ❌ | `5` | Maximum page buttons to show before ellipsis |

## Usage Examples

### Basic Usage

```tsx
import { useState } from 'react';
import Pagination from '@/components/ui/Pagination';

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = 50;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div>
      {/* Your data display here */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### With Client-Side Pagination

```tsx
import { useState, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';

function TaskList({ tasks }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  return (
    <div>
      <div className="task-list">
        {paginatedTasks.map(task => (
          <div key={task.id}>{task.title}</div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={tasks.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### Without Info Display

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  showInfo={false}  // Hide the "Showing X-Y of Z" text
/>
```

### Custom Max Page Buttons

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  maxPageButtons={7}  // Show up to 7 page buttons
/>
```

### With Server-Side Pagination

```tsx
import { useState, useEffect } from 'react';
import Pagination from '@/components/ui/Pagination';

function ServerPaginatedList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ items: [], totalItems: 0 });
  const itemsPerPage = 20;

  useEffect(() => {
    // Fetch data from API
    fetchData(currentPage, itemsPerPage).then(response => {
      setData(response.data);
    });
  }, [currentPage]);

  const totalPages = Math.ceil(data.totalItems / itemsPerPage);

  return (
    <div>
      <div className="items-list">
        {data.items.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={data.totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

## Styling

The component uses scoped styles with `styled-jsx`. The default theme uses:

- **Primary color**: `#FF5E13` (orange)
- **Hover color**: `#FFF5F0` (light orange)
- **Border color**: `#e2e8f0` (gray)
- **Text color**: `#475569` (dark gray)

The pagination will automatically hide if `totalPages <= 1`.

## Accessibility

- Uses semantic HTML with proper ARIA labels
- Keyboard navigable
- `aria-current="page"` for current page
- Disabled state for navigation buttons at boundaries
- Descriptive `aria-label` for screen readers

## Responsive Design

On mobile devices (`max-width: 640px`):
- Stacks vertically
- Centers pagination controls
- Reduces button sizes
- Centers information text

## Notes

- Page numbers are 1-indexed (start from 1, not 0)
- Component returns `null` if there's only 1 page or less
- Ellipsis (`...`) shown when there are many pages
- Previous/Next buttons automatically disable at boundaries
