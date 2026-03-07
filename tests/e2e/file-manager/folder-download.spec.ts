import { expect, test } from '@playwright/test';
import { getAuthenticatedToken } from '../helpers/auth.helper';
import {
  ALL_STORAGE_PERMISSIONS,
  createUserWithPermissions,
  getAdminToken,
  STORAGE_PERMISSIONS,
} from '../helpers/permissions.helper';
import {
  apiRequest,
  createTestFolder,
  downloadFolderViaApi,
  initializeSystemFolders,
  uploadTestFile,
} from '../helpers/storage.helper';

let userToken: string;

test.beforeAll(async () => {
  const admin = await getAdminToken();
  await initializeSystemFolders(admin.token);

  const user = await createUserWithPermissions(
    [...ALL_STORAGE_PERMISSIONS],
    `e2e-fdl-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
});

test.describe('File Manager - Download de Pasta como ZIP', () => {
  // ─── FD-1 Download pasta com arquivos ───────────────────────────────
  test('FD-1 - Deve retornar URL e fileName ao baixar pasta com arquivos', async () => {
    // ZIP: fetch files from R2 → compress → upload ZIP to R2 → presigned URL
    test.setTimeout(120_000);

    const folderName = `e2e-fd1-${Date.now()}`;
    const folderId = await createTestFolder(userToken, folderName);
    await uploadTestFile(userToken, folderId, `fd1-a-${Date.now()}.txt`);
    await uploadTestFile(userToken, folderId, `fd1-b-${Date.now()}.txt`);

    const result = await downloadFolderViaApi(userToken, folderId, 90_000);

    expect(result.url).toBeTruthy();
    expect(typeof result.url).toBe('string');
    expect(result.fileName).toBeTruthy();
    expect(result.fileName).toContain('.zip');
  });

  // ─── FD-2 Download pasta vazia ──────────────────────────────────────
  test('FD-2 - Deve funcionar ao baixar pasta vazia (ZIP vazio)', async () => {
    test.setTimeout(120_000);

    const folderName = `e2e-fd2-empty-${Date.now()}`;
    const folderId = await createTestFolder(userToken, folderName);

    const result = await downloadFolderViaApi(userToken, folderId, 90_000);

    expect(result.url).toBeTruthy();
    expect(result.fileName).toContain('.zip');
  });

  // ─── FD-3 Permissão — sem storage.user-folders.download ────────────
  test('FD-3 - Deve rejeitar download sem permissão storage.user-folders.download (403)', async () => {
    const user = await createUserWithPermissions(
      [
        STORAGE_PERMISSIONS.INTERFACE_VIEW,
        STORAGE_PERMISSIONS.USER_FOLDERS_LIST,
        STORAGE_PERMISSIONS.USER_FOLDERS_CREATE,
        STORAGE_PERMISSIONS.USER_FOLDERS_READ,
        STORAGE_PERMISSIONS.FILES_LIST,
        STORAGE_PERMISSIONS.FILES_CREATE,
        STORAGE_PERMISSIONS.FILES_READ,
        // NO USER_FOLDERS_DOWNLOAD
      ],
      `e2e-fd3-${Date.now().toString(36)}`
    );
    const auth = await getAuthenticatedToken(user.email, user.password);

    // Create folder with the admin token (user has create permission)
    const folderName = `e2e-fd3-${Date.now()}`;
    const folderId = await createTestFolder(auth.token, folderName);

    const { status } = await apiRequest(
      auth.token,
      'GET',
      `/v1/storage/folders/${folderId}/download`
    );

    expect(status).toBe(403);
  });

  // ─── FD-4 Download pasta inexistente ────────────────────────────────
  test('FD-4 - Deve retornar erro para pasta inexistente', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000099';

    const { status } = await apiRequest(
      userToken,
      'GET',
      `/v1/storage/folders/${fakeId}/download`
    );

    // Backend may return 400 or 404 depending on validation order
    expect([400, 404]).toContain(status);
  });
});
