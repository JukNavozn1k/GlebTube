
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {HomePage} from '@/pages/home'
import {WatchPage} from '@/pages/watch-video'
// import ChannelPage from '@/pages/channel'
// import UploadVideoPage from '@/pages/upload-video'
// import EditVideoPage from '@/pages/edit-video'
// import ProfilePage from '@/pages/profile'
// import ProfileSettingsPage from '@/pages/profile-settings'
// import SubscriptionsPage from '@/pages/subscriptions'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        {/* <Route path="/channel/:slug" element={<ChannelPage />} />
        <Route path="/upload" element={<UploadVideoPage />} />
        <Route path="/edit/:id" element={<EditVideoPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
