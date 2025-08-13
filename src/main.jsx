import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import MoodTracker from './components/MoodTracker.jsx'
import AllPosts from './components/AllPosts.jsx'
import JournalForm from './components/JournalForm.jsx'
import Journal from './components/Journal.jsx'
import PostCard from './components/PostCard.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/login",
            element: (
                    <Login />
            ),
        },
        {
            path: "/signup",
            element: (
                    <Signup />
            ),
        },
                        {
            path: "/moodTracker",
            element: (
                    <MoodTracker />
            ),
        },
        {
            path: "/journalForm",
            element: (
                    <JournalForm />
            ),
        },

                {
            path: "/allposts",
            element: (
                    <AllPosts />
            ),
        },
                {
            path: "/journal/:postId",
            element: (
                    <Journal />
            ),
        },
               {
            path: "/postcard/:postId",
            element: (
                    <PostCard />
            ),
        },
    ],
},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)