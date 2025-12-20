# Testing Guide - OpenSea Inventory System

## Overview
This guide provides comprehensive testing procedures for the OpenSea OS Inventory System after completing Phases 1-4 of the migration.

**System Version**: Phase 4 Complete (Phases 1-4 ✅)
**Last Updated**: 2025-12-02
**Testing Phase**: Phase 5 - Testing & Validation

---

## 1. Hierarchical Navigation Testing

### 1.1 Four-Level Cascade Test (Template → Product → Variant → Item)

**Test ID**: H-001
**Priority**: Critical
**Path**: Templates Page → Template Detail Modal → Product Detail Modal → Variant Detail Modal

**Steps**:
1. Navigate to [Templates](/stock/assets/templates)
2. Double-click any template card
3. Verify TemplateDetailModal opens with:
   - Template name and icon
   - Attribute count badges (product/variant/item attributes)
   - List of products using this template
   - Search bar for filtering products
   - Total count in footer
4. Click any product card in the modal
5. Verify ProductDetailModal opens with:
   - Product name, code, description, status
   - List of variants for this product
   - Search bar for filtering variants
   - Breadcrumb showing navigation path
6. Click any variant card in the modal
7. Verify VariantDetailModal opens with:
   - Variant name, SKU, price
   - List of items for this variant
   - Total quantity calculation
   - Search bar for filtering items
8. Verify all modals can be closed independently
9. Verify back navigation works (closing child closes parent context)

**Expected Results**:
- ✅ All modals open correctly
- ✅ Data loads without errors
- ✅ Search works in each modal
- ✅ Breadcrumbs show correct hierarchy
- ✅ Total counts are accurate
- ✅ Close/back buttons work properly

**Status**: ⏳ Pending Manual Test

---

### 1.2 Three-Level Cascade Test (Product → Variant → Item)

**Test ID**: H-002
**Priority**: High
**Path**: Products Page → Product Detail Modal → Variant Detail Modal

**Steps**:
1. Navigate to [Products](/stock/assets/products)
2. Double-click any product card
3. Verify ProductDetailModal opens with variants list
4. Click any variant card
5. Verify VariantDetailModal opens with items list
6. Test search in both modals
7. Verify data consistency with H-001

**Expected Results**:
- ✅ Modal cascade works from products page
- ✅ Data matches template cascade results
- ✅ No duplicate data loading

**Status**: ⏳ Pending Manual Test

---

### 1.3 Two-Level Cascade Test (Variant → Item)

**Test ID**: H-003
**Priority**: High
**Path**: Variants Page → Variant Detail Modal

**Steps**:
1. Navigate to [Variants](/stock/assets/variants)
2. Double-click any variant card
3. Verify VariantDetailModal opens with items list
4. Test search functionality
5. Verify total quantity calculation

**Expected Results**:
- ✅ Direct variant access works
- ✅ Items load correctly
- ✅ Quantities are accurate

**Status**: ⏳ Pending Manual Test

---

## 2. CRUD Operations Testing

### 2.1 Templates CRUD

**Test ID**: CRUD-001
**Entity**: Template
**Page**: [/stock/assets/templates](/stock/assets/templates)

**Test Cases**:

#### Create Template
1. Click "Criar Template" button
2. Fill form with:
   - Name: "Test Template - Fabric"
   - Product Attributes: `{"color": "string", "width": "number"}`
   - Variant Attributes: `{"size": "string"}`
   - Item Attributes: `{"location": "string"}`
3. Submit form
4. Verify template appears in grid
5. Verify success toast notification

#### Edit Template
1. Click edit icon on template card
2. Modify name to "Updated Test Template"
3. Add attribute: `"composition": "string"` to productAttributes
4. Submit form
5. Verify changes reflect in grid
6. Open detail modal to verify changes

#### Duplicate Template
1. Click duplicate icon on template card
2. Verify form opens with copied data
3. Change name to "Duplicated Template"
4. Submit form
5. Verify both templates exist

#### Delete Template
1. Click delete icon on template card
2. Verify confirmation dialog appears
3. Confirm deletion
4. Verify template removed from grid
5. Verify success notification

#### Multi-Select & Batch Operations
1. Click selection mode button
2. Select 3+ templates using checkboxes
3. Verify SelectionToolbar appears with count
4. Test "Select All" (Cmd/Ctrl+A)
5. Test "Deselect All" (Escape)
6. Test batch delete (if applicable)

**Expected Results**:
- ✅ All CRUD operations work
- ✅ Form validation works
- ✅ Toast notifications appear
- ✅ Grid updates in real-time
- ✅ Batch operations work correctly

**Status**: ⏳ Pending Manual Test

---

### 2.2 Products CRUD

**Test ID**: CRUD-002
**Entity**: Product
**Page**: [/stock/assets/products](/stock/assets/products)
**Permission**: MANAGER+

**Test Cases**:

#### Create Product
1. Click "Criar Produto" button
2. Fill form:
   - Template: Select "Test Template - Fabric"
   - Name: "Santista Denim Fabric"
   - Code: "DENIM-001"
   - Description: "High quality denim fabric"
   - Unit of Measure: METERS
   - Status: ACTIVE
   - Category: Select from dropdown
   - Manufacturer: Select from dropdown
3. Submit form
4. Verify product appears with correct template badge
5. Open ProductDetailModal to verify it's empty (no variants yet)

#### Edit Product
1. Click edit icon
2. Change status to INACTIVE
3. Update description
4. Submit
5. Verify badge changes to "Inativo"

#### Duplicate Product
1. Duplicate "Santista Denim Fabric"
2. Change code to "DENIM-002"
3. Verify template relationship is maintained

#### Delete Product
1. Attempt to delete product with variants (should warn)
2. Delete product without variants
3. Verify deletion

**Expected Results**:
- ✅ Template selection works
- ✅ Dynamic attributes from template appear
- ✅ Relationship to template is maintained
- ✅ Cannot delete products with variants (or warns user)

**Status**: ⏳ Pending Manual Test

---

### 2.3 Variants CRUD

**Test ID**: CRUD-003
**Entity**: Variant
**Page**: [/stock/assets/variants](/stock/assets/variants)
**Permission**: MANAGER+

**Test Cases**:

#### Create Variant
1. Click "Criar Variante"
2. Select Product: "Santista Denim Fabric"
3. Fill form:
   - Name: "Blue Denim"
   - SKU: "DENIM-001-BLUE"
   - Price: 45.00
   - Status: ACTIVE
   - Custom attributes (from template): color="blue", size="standard"
4. Submit
5. Verify variant appears with product badge

#### Edit Variant
1. Edit "Blue Denim"
2. Change price to 50.00
3. Update color attribute to "navy blue"
4. Submit
5. Verify changes

#### Duplicate Variant
1. Duplicate "Blue Denim"
2. Change to "Black Denim"
3. Update SKU and color attribute
4. Verify both variants exist under same product

#### Delete Variant
1. Attempt to delete variant with items (should warn)
2. Delete variant without items
3. Verify deletion

**Expected Results**:
- ✅ Product selection works
- ✅ Template attributes appear dynamically
- ✅ SKU generation/validation works
- ✅ Cannot delete variants with items

**Status**: ⏳ Pending Manual Test

---

### 2.4 Items Management (View Only)

**Test ID**: CRUD-004
**Entity**: Item
**Page**: [/stock/assets/items](/stock/assets/items)
**Permission**: MANAGER+

**Test Cases**:

#### Create Item (via registerEntry)
1. Note: Items cannot be created directly from items page
2. Navigate to stock entry page (if implemented)
3. Register entry:
   - Variant: "Blue Denim"
   - Quantity: 50
   - Unit Cost: 40.00
   - Location: Select warehouse location
4. Submit entry
5. Navigate to Items page
6. Verify new item appears with:
   - Variant badge
   - Quantity: 50 meters
   - Status: AVAILABLE
   - Location badge

#### View Item Details
1. Double-click item card
2. Verify modal shows:
   - Item attributes (from template)
   - Location information
   - Quantity and unit
   - Entry date
   - Status

#### Verify No Edit/Delete Actions
1. Verify item cards do NOT have edit icon
2. Verify item cards do NOT have delete icon
3. Verify item cards do NOT have duplicate icon
4. Only view action should be available

#### Search and Filter Items
1. Test search by variant name
2. Test filter by status (AVAILABLE, RESERVED, SOLD)
3. Test filter by location
4. Verify results update correctly

**Expected Results**:
- ✅ Items appear after stock entry
- ✅ No edit/delete/duplicate actions visible
- ✅ View-only mode enforced
- ✅ Search and filters work
- ✅ Quantities and locations are accurate

**Status**: ⏳ Pending Manual Test

---

### 2.5 Categories CRUD

**Test ID**: CRUD-005
**Entity**: Category
**Page**: [/admin/categories](/admin/categories)
**Permission**: MANAGER+

**Test Cases**:
1. Create category: "Fabrics"
2. Edit category name
3. Duplicate category
4. Delete category (verify warns if used by products)
5. Test search and multi-select

**Expected Results**:
- ✅ All CRUD operations work
- ✅ Referential integrity maintained

**Status**: ⏳ Pending Manual Test

---

### 2.6 Suppliers CRUD

**Test ID**: CRUD-006
**Entity**: Supplier
**Page**: [/admin/suppliers](/admin/suppliers)
**Permission**: MANAGER+

**Test Cases**:
1. Create supplier with contact info
2. Edit supplier details
3. Duplicate supplier
4. Delete supplier (verify warns if has purchase orders)
5. Test search and batch operations

**Expected Results**:
- ✅ Contact fields work correctly
- ✅ All CRUD operations work

**Status**: ⏳ Pending Manual Test

---

### 2.7 Manufacturers CRUD

**Test ID**: CRUD-007
**Entity**: Manufacturer
**Page**: [/admin/manufacturers](/admin/manufacturers)
**Permission**: MANAGER+

**Test Cases**:
1. Create manufacturer: "Santista"
2. Edit manufacturer details
3. Duplicate manufacturer
4. Delete manufacturer (verify warns if used by products)
5. Test search

**Expected Results**:
- ✅ All CRUD operations work
- ✅ Used in product selection dropdown

**Status**: ⏳ Pending Manual Test

---

### 2.8 Tags CRUD

**Test ID**: CRUD-008
**Entity**: Tag
**Page**: [/admin/tags](/admin/tags)
**Permission**: MANAGER+

**Test Cases**:
1. Create tags: "Premium", "Imported", "On Sale"
2. Edit tag name and color
3. Duplicate tag
4. Delete tag
5. Test multi-select and batch operations
6. Verify tags appear in product form

**Expected Results**:
- ✅ Color picker works
- ✅ Tags are multi-select in product form
- ✅ All CRUD operations work

**Status**: ⏳ Pending Manual Test

---

### 2.9 Locations Management

**Test ID**: CRUD-009
**Entity**: Location
**Page**: [/stock/locations](/stock/locations)
**Permission**: MANAGER+

**Test Cases**:
1. Create hierarchical locations:
   - Warehouse: "Main Warehouse"
   - Zone: "Zone A"
   - Aisle: "Aisle 1"
   - Shelf: "Shelf A"
   - Bin: "Bin 01"
2. Edit location details
3. Test capacity/occupancy tracking (if implemented)
4. Delete location (verify warns if has items)
5. Test search and hierarchy view

**Expected Results**:
- ✅ Hierarchical structure works (Warehouse → Zone → Aisle → Shelf → Bin)
- ✅ Parent-child relationships maintained
- ✅ Used in item assignment

**Status**: ⏳ Pending Manual Test

---

## 3. Search & Filter Testing

### 3.1 Search Functionality

**Test ID**: SEARCH-001
**Priority**: High

**Test on Each Page**:
1. Templates page: Search by name
2. Products page: Search by name, code, description
3. Variants page: Search by name, SKU
4. Items page: Search by variant name, location
5. Categories: Search by name
6. Suppliers: Search by name, contact
7. Manufacturers: Search by name
8. Tags: Search by name

**Test Cases**:
1. Enter partial match (e.g., "denim" should find "Santista Denim")
2. Test case-insensitive search
3. Test empty results (search for "xyz123")
4. Test special characters
5. Clear search and verify full list returns

**Expected Results**:
- ✅ Partial matches work
- ✅ Case-insensitive
- ✅ Empty state shows appropriate message
- ✅ Clear search restores full list

**Status**: ⏳ Pending Manual Test

---

### 3.2 Filter Functionality

**Test ID**: FILTER-001
**Priority**: High

**Test Filters**:
1. Products: Filter by status (ACTIVE/INACTIVE/ARCHIVED)
2. Products: Filter by category
3. Products: Filter by manufacturer
4. Products: Filter by template
5. Variants: Filter by status
6. Variants: Filter by product
7. Items: Filter by status (AVAILABLE/RESERVED/SOLD)
8. Items: Filter by location

**Expected Results**:
- ✅ Filters update results immediately
- ✅ Multiple filters can be combined
- ✅ Clear filters button works

**Status**: ⏳ Pending Manual Test

---

### 3.3 Sorting

**Test ID**: SORT-001
**Priority**: Medium

**Test Sorting**:
1. Sort by name (A-Z, Z-A)
2. Sort by date created (newest first, oldest first)
3. Sort by date updated
4. Sort by status

**Expected Results**:
- ✅ Sort order updates correctly
- ✅ Sort persists during search/filter
- ✅ Sort icon shows current direction

**Status**: ⏳ Pending Manual Test

---

## 4. Batch Operations Testing

### 4.1 Multi-Select

**Test ID**: BATCH-001
**Priority**: High

**Test on Each Entity Page**:

1. **Enter Selection Mode**:
   - Click selection mode button in toolbar
   - Verify checkboxes appear on all cards

2. **Individual Selection**:
   - Click 3 checkboxes
   - Verify SelectionToolbar appears at top
   - Verify count shows "3 selecionados"

3. **Select All (Keyboard)**:
   - Press Cmd+A (Mac) or Ctrl+A (Windows)
   - Verify all items selected
   - Verify count shows "N selecionados"

4. **Deselect All (Keyboard)**:
   - Press Escape
   - Verify all items deselected
   - Verify SelectionToolbar disappears

5. **Partial Selection**:
   - Select 5 items
   - Click "Select All" button
   - Verify all items selected
   - Click "Deselect All" button
   - Verify all items deselected

**Expected Results**:
- ✅ Checkboxes appear/disappear correctly
- ✅ SelectionToolbar shows accurate count
- ✅ Keyboard shortcuts work
- ✅ Visual feedback shows selected state

**Status**: ⏳ Pending Manual Test

---

### 4.2 Batch View

**Test ID**: BATCH-002
**Priority**: Medium

**Steps**:
1. Select 5+ items
2. Click "View Selected" in SelectionToolbar
3. Verify modal/page shows only selected items
4. Verify all selected items are displayed
5. Exit batch view
6. Verify selection is maintained

**Expected Results**:
- ✅ Batch view shows only selected items
- ✅ All data is accurate
- ✅ Selection persists after exit

**Status**: ⏳ Pending Manual Test

---

### 4.3 Batch Edit

**Test ID**: BATCH-003
**Priority**: Medium

**Test Where Applicable** (Products, Variants):

1. Select 3+ items
2. Click "Edit Selected" in SelectionToolbar
3. Verify bulk edit form opens
4. Change common field (e.g., status to INACTIVE)
5. Submit
6. Verify all selected items updated
7. Verify success notification

**Expected Results**:
- ✅ Bulk edit form shows common fields
- ✅ Changes apply to all selected items
- ✅ Non-common fields are not changed

**Status**: ⏳ Pending Manual Test

---

### 4.4 Batch Delete

**Test ID**: BATCH-004
**Priority**: High

**Steps**:
1. Create 5 test templates (for safe deletion)
2. Select all 5 test templates
3. Click "Delete Selected" in SelectionToolbar
4. Verify confirmation dialog shows count
5. Confirm deletion
6. Verify all 5 templates deleted
7. Verify success notification

**Warning Test**:
1. Select items with relationships (e.g., template with products)
2. Attempt batch delete
3. Verify warning dialog appears
4. Verify option to force delete or cancel

**Expected Results**:
- ✅ Batch delete works for multiple items
- ✅ Confirmation shows correct count
- ✅ Warns about referential integrity
- ✅ Rollback on error

**Status**: ⏳ Pending Manual Test

---

### 4.5 Batch Duplicate

**Test ID**: BATCH-005
**Priority**: Low

**Steps**:
1. Select 3 templates
2. Click "Duplicate Selected" (if available)
3. Verify duplicate form/confirmation
4. Confirm
5. Verify 3 new templates created with " (Copy)" suffix
6. Verify original templates unchanged

**Expected Results**:
- ✅ Batch duplicate creates N copies
- ✅ Copies have proper naming
- ✅ Originals unchanged

**Status**: ⏳ Pending Manual Test

---

## 5. Navigation Testing

### 5.1 Menu Structure

**Test ID**: NAV-001
**Priority**: Critical

**Steps**:

1. **Open Navigation Menu**:
   - Click menu button in navbar
   - Verify modal opens with blur backdrop
   - Verify "Aplicações" title appears
   - Verify search bar is visible

2. **Test Main Sections**:
   - Verify "Início" tile (Home icon)
   - Verify "Estoque" tile (Package icon) - should show submenu indicator
   - Verify "Administração" tile (Settings icon) - should show submenu indicator
   - Verify "Fornecimento" tile (Truck icon) - should show submenu indicator
   - Verify "Armazenamento" tile (Warehouse icon)
   - Verify "Financeiro" tile with "Em breve" badge (inactive)
   - Verify "Vendas" tile with "Em breve" badge (inactive)
   - Verify "Caixa" tile with "Em breve" badge (inactive)
   - Verify "Produção" tile with "Em breve" badge (inactive)
   - Verify "Usuários" tile with "Em breve" badge (inactive)

3. **Test Estoque Submenu**:
   - Click "Estoque" tile
   - Verify submenu opens with back button
   - Verify tiles appear:
     - 📄 Templates
     - 📦 Produtos (MANAGER+)
     - 🎨 Variantes (MANAGER+)
     - 📦 Itens (MANAGER+)
     - 📍 Localizações (MANAGER+)
   - Click "Templates" → verify navigates to `/stock/assets/templates`
   - Test back button → verify returns to main menu

4. **Test Administração Submenu**:
   - Click "Administração" tile
   - Verify submenu opens
   - Verify tiles appear:
     - 🚚 Fornecedores (MANAGER+)
     - 🏭 Fabricantes (MANAGER+)
     - 🏷️ Tags (MANAGER+)
     - 📁 Categorias (MANAGER+)
   - Click any tile → verify navigation works
   - Test back button

5. **Test Fornecimento Submenu**:
   - Click "Fornecimento" tile
   - Verify tiles appear:
     - 📄 Pedidos de Compra (MANAGER+)
     - 📄 Solicitações
   - Test navigation and back button

6. **Test Direct Navigation**:
   - Click "Armazenamento" tile
   - Verify navigates directly to `/stock/storage` (no submenu)

7. **Test Inactive Items**:
   - Try to click "Financeiro" (Em breve)
   - Verify click does nothing (inactive state)
   - Verify cursor shows not-allowed
   - Verify opacity is reduced

**Expected Results**:
- ✅ Menu opens/closes smoothly with animation
- ✅ All tiles render with correct icons
- ✅ Submenus work correctly with back navigation
- ✅ Direct navigation works for single items
- ✅ Inactive items are disabled
- ✅ Menu closes after navigation
- ✅ Backdrop click closes menu

**Status**: ⏳ Pending Manual Test

---

### 5.2 Search in Navigation Menu

**Test ID**: NAV-002
**Priority**: Medium

**Steps**:
1. Open navigation menu
2. Type "produto" in search bar
3. Verify only "Produtos" tile appears
4. Type "tag"
5. Verify only "Tags" tile appears (in submenu items)
6. Type "xyz"
7. Verify empty state message appears
8. Clear search
9. Verify all tiles return

**Expected Results**:
- ✅ Search filters tiles in real-time
- ✅ Searches both main and submenu items
- ✅ Empty state shows helpful message
- ✅ Clear search restores full menu

**Status**: ⏳ Pending Manual Test

---

### 5.3 Role-Based Menu Access

**Test ID**: NAV-003
**Priority**: Critical

**Test as USER Role**:
1. Login as USER role
2. Open navigation menu
3. Verify "Estoque" submenu shows:
   - ✅ Templates (accessible)
   - ❌ Produtos (hidden)
   - ❌ Variantes (hidden)
   - ❌ Itens (hidden)
   - ❌ Localizações (hidden)
4. Verify "Administração" section is hidden entirely
5. Verify "Fornecimento" shows:
   - ❌ Pedidos de Compra (hidden)
   - ✅ Solicitações (accessible)

**Test as MANAGER Role**:
1. Login as MANAGER role
2. Open navigation menu
3. Verify all tiles are visible except inactive ones
4. Verify all navigation works

**Test as ADMIN Role**:
1. Login as ADMIN role
2. Verify full access to all menus

**Expected Results**:
- ✅ USER sees only permitted items
- ✅ MANAGER sees all active items
- ✅ ADMIN sees everything
- ✅ Hidden items don't appear in search
- ✅ Direct URL access blocked for unauthorized users

**Status**: ⏳ Pending Manual Test

---

### 5.4 Breadcrumb Navigation (in Modals)

**Test ID**: NAV-004
**Priority**: Medium

**Steps**:
1. Open TemplateDetailModal
2. Verify breadcrumb shows: Template Name → Produtos
3. Open ProductDetailModal from template modal
4. Verify breadcrumb shows: Product Name → Variantes
5. Open VariantDetailModal from product modal
6. Verify breadcrumb shows: Variant Name → Itens

**Expected Results**:
- ✅ Breadcrumbs show correct hierarchy
- ✅ Icons match entity types
- ✅ Current level is highlighted
- ✅ Breadcrumbs update when navigating

**Status**: ⏳ Pending Manual Test

---

## 6. Build & Lint Validation

### 6.1 TypeScript Build

**Test ID**: BUILD-001
**Priority**: Critical

**Command**: `npm run build`

**Steps**:
1. Run full production build
2. Verify no TypeScript errors
3. Verify no build warnings
4. Verify all 23 pages generate successfully
5. Check build output size

**Expected Output**:
```
✓ Compiled successfully
✓ Generating static pages (23/23)
✓ Finalizing build
✓ 0 TypeScript errors
✓ 0 Build errors
```

**Status**: ⏳ Pending Execution

---

### 6.2 Lint Check

**Test ID**: BUILD-002
**Priority**: High

**Command**: `npm run lint`

**Steps**:
1. Run ESLint on entire codebase
2. Verify no errors
3. Verify no warnings (or document acceptable warnings)

**Expected Output**:
```
✓ No ESLint errors found
```

**Status**: ⏳ Pending Execution

---

### 6.3 Type Check

**Test ID**: BUILD-003
**Priority**: High

**Command**: `npm run type-check` (or `tsc --noEmit`)

**Steps**:
1. Run TypeScript compiler in check mode
2. Verify strict mode compliance
3. Verify no type errors in any file

**Expected Output**:
```
✓ No TypeScript errors found
```

**Status**: ⏳ Pending Execution

---

## 7. Performance Testing

### 7.1 Large Dataset Test

**Test ID**: PERF-001
**Priority**: Medium

**Steps**:
1. Create 100+ templates
2. Create 500+ products
3. Create 1000+ variants
4. Create 5000+ items
5. Test page load times
6. Test search response times
7. Test filter response times
8. Test modal open times

**Expected Results**:
- ✅ Pages load in < 2 seconds
- ✅ Search responds in < 500ms
- ✅ Filters respond in < 500ms
- ✅ Modals open in < 300ms
- ✅ No memory leaks
- ✅ Smooth scrolling with virtual scrolling (if implemented)

**Status**: ⏳ Pending Test

---

### 7.2 Modal Performance

**Test ID**: PERF-002
**Priority**: Medium

**Steps**:
1. Open TemplateDetailModal with 100+ products
2. Test scroll performance
3. Test search performance
4. Open nested modals (3 levels deep)
5. Close all modals rapidly
6. Verify no memory leaks

**Expected Results**:
- ✅ Smooth scrolling in modals
- ✅ Fast search filtering
- ✅ No lag when opening nested modals
- ✅ Clean modal cleanup on close

**Status**: ⏳ Pending Test

---

## 8. Regression Testing

### 8.1 Phase 1-2 Features

**Test ID**: REGR-001
**Priority**: High

**Verify**:
- ✅ Core OpenSea OS architecture still works
- ✅ useEntityCrud hook functions correctly
- ✅ useEntityPage hook functions correctly
- ✅ EntityGrid renders properly
- ✅ EntityForm validation works
- ✅ UniversalCard displays correctly
- ✅ SelectionProvider manages state
- ✅ ConfirmDialog appears on delete
- ✅ Toast notifications show

**Status**: ⏳ Pending Test

---

### 8.2 Phase 3 Features

**Test ID**: REGR-002
**Priority**: High

**Verify**:
- ✅ All 3 detail modals still work after Phase 4 changes
- ✅ Cascading navigation still functions
- ✅ Search in modals still works
- ✅ Data filtering by parent ID still works
- ✅ Modal close/back buttons still function

**Status**: ⏳ Pending Test

---

## 9. User Experience Testing

### 9.1 Responsive Design

**Test ID**: UX-001
**Priority**: Medium

**Test on Devices**:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

**Verify**:
- ✅ Navigation menu adapts to screen size
- ✅ EntityGrid switches to list view on mobile
- ✅ Modals are responsive
- ✅ Forms are usable on small screens
- ✅ Touch interactions work on mobile

**Status**: ⏳ Pending Test

---

### 9.2 Accessibility

**Test ID**: UX-002
**Priority**: Medium

**Verify**:
- ✅ Keyboard navigation works (Tab, Enter, Escape)
- ✅ Screen reader compatibility
- ✅ Color contrast meets WCAG 2.1 AA
- ✅ Focus indicators visible
- ✅ Alt text on images/icons

**Status**: ⏳ Pending Test

---

### 9.3 Dark Mode

**Test ID**: UX-003
**Priority**: Low

**Verify**:
- ✅ All pages render correctly in dark mode
- ✅ Modals render correctly in dark mode
- ✅ Forms are readable in dark mode
- ✅ Icons have proper contrast
- ✅ Badges are visible

**Status**: ⏳ Pending Test

---

## 10. Error Handling Testing

### 10.1 Network Errors

**Test ID**: ERROR-001
**Priority**: High

**Steps**:
1. Disable network
2. Try to load Templates page
3. Verify error message appears
4. Try to create a template
5. Verify error toast appears
6. Re-enable network
7. Verify retry works

**Expected Results**:
- ✅ User-friendly error messages
- ✅ No app crashes
- ✅ Retry functionality works

**Status**: ⏳ Pending Test

---

### 10.2 Validation Errors

**Test ID**: ERROR-002
**Priority**: High

**Test on Each Entity Form**:
1. Try to submit empty form
2. Verify validation errors appear
3. Try to submit with invalid data
4. Verify field-level errors show
5. Fill form correctly
6. Verify errors clear
7. Submit successfully

**Expected Results**:
- ✅ Validation prevents submission
- ✅ Clear error messages
- ✅ Errors clear when fixed
- ✅ Success feedback appears

**Status**: ⏳ Pending Test

---

### 10.3 404 Errors

**Test ID**: ERROR-003
**Priority**: Medium

**Steps**:
1. Navigate to `/invalid-route`
2. Verify 404 page appears
3. Verify navigation menu still works
4. Navigate back to valid page

**Expected Results**:
- ✅ Custom 404 page shows
- ✅ Navigation remains functional
- ✅ No console errors

**Status**: ⏳ Pending Test

---

## 11. Test Summary Template

After completing all tests, fill this summary:

### Completion Status

- **Total Tests**: 45
- **Passed**: ___ / 45
- **Failed**: ___ / 45
- **Skipped**: ___ / 45
- **Blocked**: ___ / 45

### Critical Issues Found

1. [Issue description]
2. [Issue description]

### Non-Critical Issues Found

1. [Issue description]
2. [Issue description]

### Recommendations

1. [Recommendation]
2. [Recommendation]

### Sign-Off

- **Tested By**: _______________
- **Date**: _______________
- **Phase 5 Status**: ✅ Complete / ⚠️ Complete with Issues / ❌ Incomplete

---

## 12. Next Steps After Phase 5

1. **Fix Critical Bugs**: Address any P0/P1 issues found
2. **Optimize Performance**: Implement virtual scrolling if needed
3. **Add Automated Tests**: Create Jest/Playwright tests for critical paths
4. **Documentation**: Update user guide with Phase 5 findings
5. **Deployment**: Deploy to staging environment
6. **User Acceptance Testing**: Get feedback from real users
