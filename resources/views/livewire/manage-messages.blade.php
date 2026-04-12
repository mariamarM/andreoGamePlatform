<div>
    <form class="bg-white rounded-lg shadow-lg p-6 mb-4" wire:submit="save">
        <div class="mb-4">
            <label class="block font-medium text-sm text-gray-700 mb-1">Mensaje</label>
            <textarea wire:model="content" class="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" rows="3" placeholder="Ingrese un mensaje"></textarea>
            @error('content') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>
        <div class="flex justify-end">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Enviar
            </button>
        </div>
    </form>

    @if($mensajes->count())
        <div class="bg-white rounded-lg shadow-lg p-6">
            <ul class="space-y-4">
                @foreach ($mensajes as $message)
                    <li class="flex">
                        <div class="mr-4 shrink-0">
                            <img class="h-8 w-8 rounded-full object-cover object-center" src="{{ $message->user->profile_photo_url }}" alt="">
                        </div>
                        <div class="flex-1">
                            <p>
                                <b>{{ $message->user->name }}</b>
                                <span class="text-xs text-gray-500">{{ $message->created_at->diffForHumans() }}</span>
                            </p>
                            <div>{{ $message->content }}</div>
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif
</div>
