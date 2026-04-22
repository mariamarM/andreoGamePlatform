<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $facePhotoPath = null;
        $facePhotoData = $input['face_photo'] ?? '';

        if (! empty($facePhotoData) && str_contains($facePhotoData, 'data:image')) {
            $imageData = $facePhotoData;
            $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
            $imageData = str_replace('data:image/png;base64,', '', $imageData);
            $imageData = base64_decode($imageData, true);

            if ($imageData !== false) {
                $filename = 'face_photos/'.uniqid('face_').'.jpg';
                $path = storage_path('app/public/'.$filename);

                if (! is_dir(dirname($path))) {
                    mkdir(dirname($path), 0755, true);
                }

                file_put_contents($path, $imageData);
                $facePhotoPath = $filename;
            }
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'face_photo' => $facePhotoPath,
            'role_id' => 3,
        ]);
    }
}
