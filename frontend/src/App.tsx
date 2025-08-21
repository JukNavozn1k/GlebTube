import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/home"
import { WatchPage } from "@/pages/watch-video"
import { ChannelPage } from "@/pages/channel"
import { UploadPage } from "@/pages/upload-video"
import { EditVideoPage } from "@/pages/edit-video"
import { ProfilePage } from "@/pages/profile"
import { ProfileSettingsPage } from "@/pages/profile-settings"
import { SubscriptionsPage } from "@/pages/subscriptions"

import { ClientLayout } from "@/ClientLayout"
import { AuthPage } from "@/pages/auth"
import {StarredPage} from "@/pages/starred"
import {HistoryPage} from "@/pages/history"
import { ChannelsPage } from "@/pages/channels"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout-обертка */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/channel/:slug" element={<ChannelPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/video/:id/edit" element={<EditVideoPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
