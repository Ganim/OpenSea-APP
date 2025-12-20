# Implementation Plan: Grid Selection & Navigation Fixes

## Overview
This plan addresses three major areas of improvement for the OpenSea OS entity system:
1. **Grid Selection System** - Windows Explorer-like selection behavior
2. **Navigation Pattern** - Detail pages instead of modals for single-item view
3. **CreateProductForm UI** - Step indicators and simplified fields

## Analysis

### Current Architecture

**EntityGrid Component** (`src/core/components/entity-grid.tsx`):
- Already implements drag selection (lines 118-255)
- Click handlers at lines 273-314
- Single-click selection requires Ctrl/Cmd (line 291)
- Shift+click for range selection works (lines 278-288)
- Missing: Context menu (right-click) support

**UniversalCard Component** (`src/core/components/universal-card.tsx`):
- Renders checkboxes when `showSelection={true}` (lines 310-322)
- Checkbox visible in grid variant (line 344)
- Checkbox visible in list variant (line 400)

**useEntityPage Hook** (`src/core/hooks/use-entity-page.ts`):
- `handleItemDoubleClick` currently opens modal (lines 240-251)
- Falls back to `editRoute` if provided (line 242)
- No detail pages exist yet - all deleted in recent commits

### Key Issues Identified

1. **Selection Behavior**:
   - Line 291-293 in EntityGrid: Click only selects if Ctrl/Cmd pressed
   - Expected: Single click should select (like Windows Explorer)
   - Expected: Ctrl+click should toggle (multi-select)

2. **Context Menu**:
   - No right-click handler in EntityGrid
   - Need to add `onContextMenu` handler

3. **Checkboxes**:
   - UniversalCard shows checkboxes when `showSelection={true}`
   - Need to pass `showSelection={false}` to cards

4. **Navigation**:
   - No detail page routes exist (user deleted them all)
   - Need to create: `/stock/assets/templates/[id]/page.tsx`
   - Need to create: `/stock/assets/products/[id]/page.tsx`
   - Need to create: `/stock/assets/variants/[id]/page.tsx`
   - Need to create: `/stock/assets/items/[id]/page.tsx`

5. **CreateProductForm**:
   - No step indicator (1/2, 2/2)
   - Step 1 missing title and instructions
   - Step 2 has unnecessary fields (code, description, status)
   - "Click to change" should be "Trocar Template" button
   - Bottom "Voltar aos Templates" button should be removed

## Implementation Plan

### Phase 1: Fix Grid Selection System

#### 1.1 Modify EntityGrid Click Behavior
**File**: `src/core/components/entity-grid.tsx`

**Changes**:
- Lines 273-304: Update `handleItemClick` logic
- **OLD LOGIC**: Single click → call `onItemClick` → fallback to toggle
- **NEW LOGIC**:
  - Single click → select (and clear previous if not Ctrl)
  - Ctrl+click → toggle selection (multi-select)
  - Shift+click → range selection (keep existing)

**Implementation**:
```typescript
const handleItemClick = useCallback(
  (item: T, e: React.MouseEvent) => {
    e.stopPropagation();

    // Shift+click: Range selection
    if (e.shiftKey && selectionActions && selectionContext?.state.lastSelectedId) {
      selectionActions.selectRange(selectionContext.state.lastSelectedId, item.id);
      return;
    }

    // Ctrl/Cmd+click: Toggle selection (multi-select)
    if ((e.ctrlKey || e.metaKey) && selectionActions) {
      selectionActions.toggle(item.id);
      return;
    }

    // Single click: Select this item (clear others)
    if (selectionActions) {
      selectionActions.select(item.id);
    }

    // Call custom handler if provided
    if (onItemClick) {
      onItemClick(item, e);
    }
  },
  [onItemClick, selectionActions, selectionContext]
);
```

#### 1.2 Add Context Menu Support
**File**: `src/core/components/entity-grid.tsx`

**Changes**:
- Add `onContextMenu` prop to EntityGridProps (line 56)
- Add context menu handler (after line 314)
- Wire up to both grid and list item wrappers (lines 418, 447)

**Implementation**:
```typescript
// In EntityGridProps interface:
onContextMenu?: (item: T, event: React.MouseEvent) => void;

// Handler:
const handleContextMenu = useCallback(
  (item: T, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If item not selected, select it first
    if (selectionActions && !selectedIds.has(item.id)) {
      selectionActions.select(item.id);
    }

    if (onContextMenu) {
      onContextMenu(item, e);
    }
  },
  [onContextMenu, selectionActions, selectedIds]
);

// In render (grid variant):
<ItemWrapper
  ...
  onContextMenu={(e: React.MouseEvent) => handleContextMenu(item, e)}
>
```

#### 1.3 Remove Checkboxes from Cards
**File**: `src/app/(dashboard)/stock/assets/products/page.tsx` (and all entity pages)

**Changes**:
- In EntityGrid's `renderGridItem` and `renderListItem` functions
- Pass `showSelection={false}` to UniversalCard

**Implementation**:
```typescript
renderGridItem: (item, isSelected) => (
  <UniversalCard
    {...}
    showSelection={false}  // Add this
  />
)
```

#### 1.4 Add List-Only View Option
**File**: `src/core/components/entity-grid.tsx`

**Changes**:
- Already has `showViewToggle` prop (line 69)
- Just ensure entity pages don't force grid mode
- Document that setting `defaultView="list"` enables list-only mode

**Note**: No code changes needed - feature already exists!

---

### Phase 2: Create Detail Pages

#### 2.1 Create Template Detail Page
**File**: `src/app/(dashboard)/stock/assets/templates/[id]/page.tsx` (NEW)

**Implementation**:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { templatesService } from '@/services/stock';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
// ... full detailed view with all template fields
```

**Features**:
- Show all template details
- Edit and Delete buttons
- Back navigation
- Related items (products using this template)

#### 2.2 Create Product Detail Page
**File**: `src/app/(dashboard)/stock/assets/products/[id]/page.tsx` (NEW)

**Similar structure to template detail page**

#### 2.3 Create Variant Detail Page
**File**: `src/app/(dashboard)/stock/assets/variants/[id]/page.tsx` (NEW)

#### 2.4 Create Item Detail Page
**File**: `src/app/(dashboard)/stock/assets/items/[id]/page.tsx` (NEW)

#### 2.5 Update Entity Configs
**Files**:
- `src/config/entities/templates.config.ts`
- `src/config/entities/products.config.ts`
- `src/config/entities/variants.config.ts`
- `src/config/entities/items.config.ts`

**Changes**: Add `viewRoute` to each config
```typescript
export const templatesConfig: EntityConfig<Template> = {
  // ...
  routes: {
    list: '/stock/assets/templates',
    create: '/stock/assets/templates/new',
    edit: (id) => `/stock/assets/templates/${id}/edit`,
    view: (id) => `/stock/assets/templates/${id}`,  // ADD THIS
  },
};
```

#### 2.6 Update useEntityPage Hook Usage
**Files**: All entity pages (products, templates, variants, items)

**Changes**: Pass `viewRoute` to useEntityPage
```typescript
const page = useEntityPage({
  // ...
  viewRoute: (id) => `/stock/assets/templates/${id}`,
});
```

---

### Phase 3: Fix CreateProductForm UI

#### 3.1 Add Step Indicator
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Add step indicator before content (line 207 and 288)

**Implementation**:
```typescript
{/* Step Indicator */}
<div className="flex items-center justify-center gap-2 mb-6">
  <div className={cn(
    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
    step === 'select-template'
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground"
  )}>
    1
  </div>
  <div className="h-0.5 w-12 bg-muted" />
  <div className={cn(
    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
    step === 'fill-data'
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground"
  )}>
    2
  </div>
</div>
```

#### 3.2 Add Title and Instructions to Step 1
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Add after step indicator (line 207)

**Implementation**:
```typescript
{/* Title and Instructions */}
<div className="text-center mb-6">
  <h2 className="text-xl font-semibold mb-2">
    Seleção de Template do Novo Produto
  </h2>
  <p className="text-sm text-muted-foreground">
    Primeiro, selecione o template que será usado como base para o produto.
    O template define a categoria, unidade de medida e atributos do produto.
  </p>
</div>
```

#### 3.3 Add "Selecionar" Button to Template Items
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Line 237-268, modify Card structure

**Implementation**:
```typescript
<Card className="p-3 flex items-center gap-3 hover:shadow-md transition-all">
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shrink-0">
    <FileText className="h-5 w-5 text-white" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="font-medium text-sm truncate">{template.name}</h3>
    <p className="text-xs text-muted-foreground truncate">{template.code}</p>
  </div>
  <Badge variant="outline" className="text-xs">{/* unit */}</Badge>
  <Button
    size="sm"
    onClick={() => handleTemplateSelect(template)}
  >
    Selecionar
  </Button>
</Card>
```

#### 3.4 Replace "Click to Change" with Button
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Lines 289-322, modify template card

**Implementation**:
```typescript
<div className="flex items-start gap-4">
  <Card className="flex-1 p-4 flex items-start gap-4 bg-muted/50">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shrink-0">
      <FileText className="h-6 w-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold truncate">{selectedTemplate?.name}</h3>
      <p className="text-sm text-muted-foreground truncate">{selectedTemplate?.code}</p>
    </div>
    <Badge variant="outline">{/* unit */}</Badge>
  </Card>
  <Button
    type="button"
    variant="outline"
    onClick={handleBackToTemplates}
    disabled={isSubmitting}
  >
    Trocar Template
  </Button>
</div>
```

#### 3.5 Remove Unnecessary Fields
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Remove from Step 2 (lines 324-393)
- ❌ Remove: Code field (lines 342-355)
- ❌ Remove: Description field (lines 357-368)
- ❌ Remove: Status field (lines 370-393)
- ✅ Keep: Name field (lines 326-340)

#### 3.6 Remove Bottom "Voltar aos Templates" Button
**File**: `src/components/stock/create-product-form.tsx`

**Changes**: Line 406-415, update footer

**Implementation**:
```typescript
{/* Footer */}
<div className="flex justify-end gap-2 pt-4 border-t">
  <Button
    type="button"
    variant="outline"
    onClick={handleCancel}
    disabled={isSubmitting}
  >
    Fechar
  </Button>
  <Button type="submit" disabled={isSubmitting || !formData.name}>
    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    Criar Produto
  </Button>
</div>
```

---

## Implementation Order

### Priority 1 (Most Impactful)
1. Phase 3: Fix CreateProductForm UI (user reported "péssimo" - critical UX issue)
2. Phase 1.1-1.3: Fix grid selection behavior (core functionality)

### Priority 2 (Foundation)
3. Phase 2.1-2.4: Create detail pages (enables new navigation pattern)
4. Phase 2.5-2.6: Wire up detail pages to configs

### Priority 3 (Polish)
5. Phase 1.2: Add context menu support (enhances UX)

---

## Testing Plan

### Grid Selection Tests
- [ ] Single click selects item (and clears previous selection)
- [ ] Ctrl+click toggles selection (multi-select)
- [ ] Shift+click selects range
- [ ] Drag selection works
- [ ] Right-click shows context menu
- [ ] Right-click on unselected item selects it first
- [ ] No checkboxes visible on cards

### Navigation Tests
- [ ] Double-click opens detail page (NOT modal)
- [ ] Detail page shows all entity information
- [ ] Back button returns to list
- [ ] Edit button navigates to edit page
- [ ] Modal only used for batch operations

### CreateProductForm Tests
- [ ] Step indicator shows 1/2 and 2/2
- [ ] Step 1 has title "Seleção de Template do Novo Produto"
- [ ] Step 1 has explanatory text
- [ ] Template list is compact
- [ ] "Selecionar" button works on each template
- [ ] Step 2 shows selected template card
- [ ] "Trocar Template" button goes back to Step 1
- [ ] Step 2 only has Name field
- [ ] No code, description, status fields
- [ ] No bottom "Voltar aos Templates" button
- [ ] Footer only has "Fechar" and "Criar Produto"
- [ ] Modal stays open after creating product
- [ ] Can create multiple products rapidly

---

## Files to Modify

### Core System (Grid & Selection)
- ✏️ `src/core/components/entity-grid.tsx`
- 📄 `src/app/(dashboard)/stock/assets/products/page.tsx`
- 📄 `src/app/(dashboard)/stock/assets/templates/page.tsx`
- 📄 `src/app/(dashboard)/stock/assets/variants/page.tsx`
- 📄 `src/app/(dashboard)/stock/assets/items/page.tsx`

### Detail Pages (NEW)
- ➕ `src/app/(dashboard)/stock/assets/templates/[id]/page.tsx`
- ➕ `src/app/(dashboard)/stock/assets/products/[id]/page.tsx`
- ➕ `src/app/(dashboard)/stock/assets/variants/[id]/page.tsx`
- ➕ `src/app/(dashboard)/stock/assets/items/[id]/page.tsx`

### Entity Configs
- ✏️ `src/config/entities/templates.config.ts`
- ✏️ `src/config/entities/products.config.ts`
- ✏️ `src/config/entities/variants.config.ts`
- ✏️ `src/config/entities/items.config.ts`

### Product Creation
- ✏️ `src/components/stock/create-product-form.tsx`

---

## Risk Assessment

### Low Risk
- CreateProductForm changes (isolated component)
- Adding viewRoute to configs (optional property)
- Removing checkboxes (visual only)

### Medium Risk
- EntityGrid click behavior changes (could affect other entity pages)
- Need to test all entity pages after changes

### Mitigation
- Test in templates page first (user's example)
- Then apply to products, variants, items
- Keep existing onItemClick callback for flexibility

---

## Success Criteria

✅ Single-click selection works like Windows Explorer
✅ Context menu appears on right-click
✅ No checkboxes visible on grid cards
✅ Double-click opens detail page (not modal)
✅ CreateProductForm has step indicators
✅ CreateProductForm Step 1 has title and instructions
✅ CreateProductForm Step 2 only has Name field
✅ CreateProductForm has "Trocar Template" button
✅ All changes apply to ALL entity pages in OpenSea OS

---

## Notes

- User emphasized: "essas observações servem para todas as páginas do sistema OpenSea OS"
- Must apply changes consistently across templates, products, variants, and items
- User specifically mentioned templates page as example but wants system-wide fixes
- Modal viewing only for batch operations (multiple items selected)
- List-only view option already exists via `defaultView` prop - just needs documentation
