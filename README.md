This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Dokumentasi API

Dokumentasi ini menjelaskan endpoint API yang tersedia.

## Endpoint API

### Autentikasi (`/auth`)

#### 1. Login (`/auth/login`)

- **Metode:** `POST`
- **Deskripsi:** Login pengguna.
- **Request Body:**

  ```json
  {
    "username": "your_username", // Minimal 7 karakter
    "password": "your_password" // Minimal 7 karakter
  }
  ```

- **Respon:**
  - Sukses: Mengembalikan token autentikasi (JWT).
  - Gagal: Mengembalikan pesan error.

#### 2. Registrasi (`/auth/register`)

- **Metode:** `POST`
- **Deskripsi:** Registrasi pengguna baru (peran otomatis "Operator").
- **Request Body:**

  ```json
  {
    "username": "new_username", // Minimal 7 karakter
    "password": "new_password" // Minimal 7 karakter
  }
  ```

- **Respon:**
  - Sukses: Mengembalikan informasi pengguna yang terdaftar.
  - Gagal: Mengembalikan pesan error.

### Laporan (`/reports`)

#### 3. Ringkasan Laporan Operator (`/reports/operator-summary`)

- **Metode:** `GET`
- **Deskripsi:** Mendapatkan ringkasan laporan operator.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data laporan ringkasan operator.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

#### 4. Ringkasan Laporan Work Order (`/reports/work-order-summary`)

- **Metode:** `GET`
- **Deskripsi:** Mendapatkan ringkasan laporan work order.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data laporan ringkasan work order.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

### Pengguna (`/users`)

#### 5. Daftar Pengguna (`/users`)

- **Metode:** `GET`, `POST`
- **Deskripsi:**
  - `GET`: Mendapatkan daftar pengguna.
  - `POST`: Membuat pengguna baru.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data pengguna.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

#### 6. Detail Pengguna (`/users/[id]`)

- **Metode:** `GET`, `PUT`, `DELETE`
- **Deskripsi:**
  - `GET`: Mendapatkan detail pengguna berdasarkan ID.
  - `PUT`: Memperbarui data pengguna berdasarkan ID.
  - `DELETE`: Menghapus pengguna berdasarkan ID.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data pengguna yang diperbarui atau dihapus.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

### Work Orders (`/work-orders`)

#### 7. Daftar Work Orders (`/work-orders`)

- **Metode:** `GET`, `POST`
- **Deskripsi:**
  - `GET`: Mendapatkan daftar work orders.
  - `POST`: Membuat work order baru.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data work orders.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

#### 8. Detail Work Order (`/work-orders/[id]`)

- **Metode:** `GET`, `PUT`, `DELETE`
- **Deskripsi:**
  - `GET`: Mendapatkan detail work order berdasarkan ID.
  - `PUT`: Memperbarui data work order berdasarkan ID.
  - `DELETE`: Menghapus work order berdasarkan ID.
- **Otorisasi:** Memerlukan token Bearer (JWT) di header `Authorization`.
- **Respon:**
  - Sukses: Mengembalikan data work order yang diperbarui atau dihapus.
  - Gagal: Mengembalikan pesan error (misalnya, otorisasi gagal).

## Catatan

- Semua endpoint yang memerlukan otorisasi menggunakan token Bearer (JWT) yang dikirimkan di header `Authorization`.
- Endpoint `/auth/register` secara otomatis memberikan peran "Operator" kepada pengguna baru.
- Endpoint `/work-orders/` (GET) memerlukan otorisasi Bearer.

## Env

- DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
- secretkey = ""
