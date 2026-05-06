<template>
  <div class="assets-page">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="page-title">
            <h2>素材管理</h2>
            <p class="page-subtitle">管理和浏览你的素材资产</p>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索素材名称、标签..."
              size="large"
              @input="handleSearch"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="view-toggle">
            <div class="toggle-container">
              <div
                class="toggle-slider"
                :style="{
                  transform:
                    viewMode === 'grid' ? 'translateX(0)' : 'translateX(100%)',
                }"
              ></div>
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <el-icon><Grid /></el-icon>
              </button>
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <el-icon><List /></el-icon>
              </button>
            </div>
          </div>
          <el-upload
            action="/api/assets/upload"
            name="files"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :timeout="120000"
            multiple
          >
            <el-button type="primary" size="large" class="upload-btn">
              <el-icon><Upload /></el-icon>
              上传素材
            </el-button>
          </el-upload>
        </div>
      </div>
    </el-card>

    <div v-if="viewMode === 'grid'" class="assets-grid" v-loading="loading">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="asset-card"
        @mouseenter="asset._hovered = true"
        @mouseleave="asset._hovered = false"
      >
        <div class="asset-preview">
          <div class="preview-overlay" :class="{ visible: asset._hovered }">
            <el-button
              text
              circle
              @click="handlePreview(asset)"
              class="overlay-btn"
            >
              <el-icon><View /></el-icon>
            </el-button>
            <el-button
              text
              circle
              @click="handleDownload(asset)"
              class="overlay-btn"
            >
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button
              text
              circle
              @click="handleEdit(asset)"
              class="overlay-btn"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
              text
              circle
              @click="handleDelete(asset)"
              class="overlay-btn danger"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div
            class="file-icon"
            v-if="
              !isImage(asset.mimeType) &&
              !isVideo(asset.mimeType) &&
              !asset._hovered
            "
          >
            <el-icon :size="48"><Document /></el-icon>
          </div>
          <img
            v-if="isImage(asset.mimeType)"
            :src="getPreviewUrl(asset)"
            :alt="asset.name"
          />
          <video
            v-else-if="isVideo(asset.mimeType)"
            :src="getPreviewUrl(asset)"
          />
        </div>
        <div class="asset-info">
          <div class="asset-name" :title="asset.name">{{ asset.name }}</div>
          <div class="asset-meta">
            <span class="asset-size">{{ formatFileSize(asset.size) }}</span>
            <span class="asset-date">{{ formatDate(asset.createdAt) }}</span>
          </div>
          <div class="asset-tags" v-if="asset.tags && asset.tags.length">
            <el-tag
              v-for="tag in asset.tags.slice(0, 2)"
              :key="tag"
              size="small"
              effect="plain"
              class="asset-tag"
              >{{ tag }}</el-tag
            >
            <el-tag
              v-if="asset.tags.length > 2"
              size="small"
              effect="plain"
              class="asset-tag"
              >+{{ asset.tags.length - 2 }}</el-tag
            >
          </div>
        </div>
      </div>
    </div>

    <div v-else class="assets-list" v-loading="loading">
      <el-card shadow="never">
        <el-table :data="assets" style="width: 100%" class="assets-table">
          <el-table-column label="预览" width="80">
            <template #default="{ row }">
              <div class="table-preview">
                <img v-if="isImage(row.mimeType)" :src="getPreviewUrl(row)" />
                <video
                  v-else-if="isVideo(row.mimeType)"
                  :src="getPreviewUrl(row)"
                />
                <el-icon v-else :size="24"><Document /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="上传者" width="120">
            <template #default="{ row }">
              <div class="uploader-info">
                <el-avatar
                  :size="22"
                  :style="{
                    background:
                      'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                  }"
                >
                  {{ row.owner?.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <span>{{
                  row.owner?.nickname || row.owner?.username || "未知"
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="100">
            <template #default="{ row }">{{
              formatFileSize(row.size)
            }}</template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.category" size="small" effect="plain">{{
                row.category
              }}</el-tag>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="tags" label="标签" width="200">
            <template #default="{ row }">
              <el-tag
                v-for="tag in row.tags?.slice(0, 3) || []"
                :key="tag"
                size="small"
                effect="plain"
                style="margin: 2px"
                >{{ tag }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="上传时间" width="160">
            <template #default="{ row }">{{
              formatDateTime(row.createdAt)
            }}</template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button text size="small" @click="handlePreview(row)">
                  <el-icon :size="14"><View /></el-icon>预览
                </el-button>
                <el-button text size="small" @click="handleDownload(row)">
                  <el-icon :size="14"><Download /></el-icon>下载
                </el-button>
                <el-button text size="small" @click="handleEdit(row)">
                  <el-icon :size="14"><Edit /></el-icon>编辑
                </el-button>
                <el-button
                  text
                  type="danger"
                  size="small"
                  @click="handleDelete(row)"
                >
                  <el-icon :size="14"><Delete /></el-icon>删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="fetchAssets"
      />
    </div>

    <el-dialog
      v-model="previewVisible"
      title="素材预览"
      width="80%"
      top="5vh"
      :close-on-click-modal="true"
    >
      <div class="preview-modal">
        <div class="preview-header">
          <h3>{{ previewAsset?.name }}</h3>
          <div class="preview-actions">
            <el-button size="small" @click="handleDownload(previewAsset)">
              <el-icon><Download /></el-icon>下载
            </el-button>
          </div>
        </div>
        <div class="preview-body">
          <img
            v-if="previewAsset && isImage(previewAsset.mimeType)"
            :src="getPreviewUrl(previewAsset)"
          />
          <video
            v-else-if="previewAsset && isVideo(previewAsset.mimeType)"
            :src="getPreviewUrl(previewAsset)"
            controls
          />
          <el-empty v-else description="暂不支持此类型预览" />
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑素材" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="editForm.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="editForm.tagsStr"
            placeholder="用逗号分隔多个标签，如：设计,UI,图标"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Upload,
  Document,
  View,
  Download,
  Edit,
  Delete,
  Grid,
  List,
} from "@element-plus/icons-vue";
import api from "../utils/api";

const assets = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const viewMode = ref<"grid" | "list">("grid");
const previewVisible = ref(false);
const previewAsset = ref<any>(null);
const editVisible = ref(false);
const editForm = ref({
  id: 0,
  name: "",
  category: "",
  tagsStr: "",
});

const user = computed(() => JSON.parse(localStorage.getItem("user") || "{}"));

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
}));

onMounted(() => {
  fetchAssets();
});

const fetchAssets = async () => {
  loading.value = true;
  try {
    const response: any = await api.get("/assets", {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
      },
    });
    assets.value = (response.assets || []).map((a: any) => ({
      ...a,
      _hovered: false,
    }));
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error("获取素材列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchAssets();
};

const handleUploadSuccess = async () => {
  ElMessage.success("上传成功");
  fetchAssets();

  try {
    const response: any = await api.get("/users/profile");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...userData, ...response }));
    window.dispatchEvent(
      new CustomEvent("user-updated", {
        detail: { ...userData, ...response },
      }),
    );
  } catch (error) {
    console.error("Failed to refresh user data");
  }
};

const handleUploadError = (error: any) => {
  console.error("Upload error:", error);
  const message =
    error?.response?.data?.message || error?.message || "上传失败";
  ElMessage.error(message);
};

const handlePreview = (row: any) => {
  previewAsset.value = row;
  previewVisible.value = true;
};

const handleDownload = async (row: any) => {
  try {
    const response: any = await api.get(`/assets/${row.id}/download`, {
      responseType: "blob",
      transformResponse: [(data) => data],
    });
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    const encodedName = encodeURIComponent(row.originalName);
    link.setAttribute("download", encodedName);
    link.setAttribute("download", decodeURIComponent(encodedName));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success("下载成功");
  } catch (error) {
    ElMessage.error("下载失败");
  }
};

const handleEdit = (row: any) => {
  editForm.value = {
    id: row.id,
    name: row.name,
    category: row.category || "",
    tagsStr: row.tags ? row.tags.join(", ") : "",
  };
  editVisible.value = true;
};

const handleUpdate = async () => {
  try {
    await api.put(`/assets/${editForm.value.id}`, {
      name: editForm.value.name,
      category: editForm.value.category,
      tags: editForm.value.tagsStr
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
    });
    ElMessage.success("更新成功");
    editVisible.value = false;
    fetchAssets();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "更新失败");
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除素材「${row.name}」吗？此操作不可撤销。`,
      "确认删除",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );
    await api.delete(`/assets/${row.id}`);
    ElMessage.success("删除成功");
    fetchAssets();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const isImage = (mimeType: string) => mimeType?.startsWith("image/");
const isVideo = (mimeType: string) => mimeType?.startsWith("video/");

const getPreviewUrl = (row: any) =>
  `/api/assets/${row.id}/file?token=${localStorage.getItem("token")}`;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

const formatDate = (date: string) => new Date(date).toLocaleDateString("zh-CN");
const formatDateTime = (date: string) => new Date(date).toLocaleString("zh-CN");
</script>

<style scoped>
.assets-page {
  max-width: 1600px;
  margin: 0 auto;
}

.toolbar-card {
  margin-bottom: 20px;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  width: 280px;
}

.toggle-container {
  position: relative;
  display: flex;
  background: var(--bg-color);
  border-radius: 12px;
  padding: 3px;
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: var(--primary-color);
  border-radius: 9px;
  transition: transform var(--transition-normal);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.toggle-btn {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 9px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  padding: 0;
}

.toggle-btn.active {
  color: white;
}

.toggle-btn:hover:not(.active) {
  color: var(--text-primary);
}

.toggle-btn .el-icon {
  font-size: 16px;
}

.upload-btn {
  border-radius: 12px !important;
  height: 44px;
  padding: 0 24px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.asset-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.asset-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.asset-preview {
  position: relative;
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dark .asset-preview {
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.asset-preview img,
.asset-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  color: var(--text-secondary);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.preview-overlay.visible {
  opacity: 1;
}

.overlay-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(4px);
}

.overlay-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.overlay-btn.danger:hover {
  background: rgba(239, 68, 68, 0.6) !important;
}

.asset-info {
  padding: 14px;
}

.asset-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.asset-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.asset-tag {
  font-size: 11px !important;
}

.assets-list {
  margin-bottom: 24px;
}

.table-preview {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-preview img,
.table-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploader-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 2px;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.action-buttons :deep(.el-button) {
  padding: 4px 8px;
  font-size: 12px;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0 !important;
}

.text-muted {
  color: var(--text-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
}

.preview-modal {
  min-height: 400px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.preview-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
}

.preview-body img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
}

.preview-body video {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
}

:deep(.assets-table .el-table__header-wrapper th) {
  background: var(--bg-color) !important;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: var(--card-bg);
}
</style>
