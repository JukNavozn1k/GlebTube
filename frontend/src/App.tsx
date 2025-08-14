import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/home"
import { WatchPage } from "@/pages/watch-video"
import { ChannelPage } from "@/pages/channel"
import { UploadPage } from "@/pages/upload-video"
import { EditVideoPage } from "@/pages/edit-video"
import { ProfilePage } from "@/pages/profile"
import { ProfileSettingsPage } from "@/pages/profile-settings"
import { SubscriptionsPage } from "@/pages/subscriptions"
import { NotFound } from "@/pages/not-found"
import { ClientLayout } from "@/ClientLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout-обертка */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/channel/:slug" element={<ChannelPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/edit/:id" element={<EditVideoPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
        </Route>

        {/* Отдельно NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
