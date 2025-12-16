'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProfileContent } from '@/lib/types'
import { Star, Check } from 'lucide-react'

interface NutritionModuleProps {
  profileContent: ProfileContent
}

export function NutritionModule({ profileContent }: NutritionModuleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Nutrition Guide</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Personalized for your profile type
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Star Food of the Day */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            <h3 className="font-bold text-yellow-900">Today's Star Food</h3>
          </div>
          
          <div className="bg-white/80 p-3 rounded-lg">
            <p className="font-bold text-lg text-gray-900 mb-1">
              {profileContent.star_food_name}
            </p>
            {profileContent.star_food_description && (
              <p className="text-sm text-gray-700">
                {profileContent.star_food_description}
              </p>
            )}
          </div>
        </div>

        {/* Allowed Foods List */}
        {profileContent.allowed_foods && profileContent.allowed_foods.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Foods You Can Enjoy
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {profileContent.allowed_foods.map((food, index) => (
                <div
                  key={index}
                  className="bg-green-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-green-200"
                >
                  ✓ {food}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-secondary-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Remember:</strong> These foods are specifically chosen 
            to support your body's unique needs and help overcome your metabolic challenges.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

