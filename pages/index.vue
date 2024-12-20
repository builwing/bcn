<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-300 m-0 p-0 overflow-hidden">
    <!-- コンテンツエリア -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- ヒーローセクション -->
      <div class="text-center">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
          Beauty Compass
          <span class="block text-pink-600">あなたの美の道標に</span>
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          美容整形・化粧品・健康器具の口コミ・体験談を共有し、あなたに合った美容情報をお届けします。
        </p>
        <!-- CTAボタン -->
        <div class="mt-10 flex justify-center gap-4">
          <NuxtLink
            to="/posts"
            class="btn-primary inline-block text-center"
          >
            投稿一覧を見る
          </NuxtLink>
          <NuxtLink
            to="/posts/create"
            class="btn-primary inline-block text-center"
          >
            投稿する
          </NuxtLink>
        </div>
      </div>

      <!-- 特徴セクション -->
      <div class="mt-16">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <!-- 特徴1 -->
          <div class="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">リアルな体験談</h3>
            <p class="text-gray-600">実際の利用者による信頼できる情報を提供します。</p>
          </div>

          <!-- 特徴2 -->
          <div class="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">詳細な比較</h3>
            <p class="text-gray-600">製品やサービスの詳細な比較情報を提供します。</p>
          </div>

          <!-- 特徴3 -->
          <div class="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">活発なコミュニティ</h3>
            <p class="text-gray-600">ユーザー同士で情報交換が可能なコミュニティを提供します。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>