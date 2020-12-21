export class Event {

    public type: string;
    public data: object;
    constructor(type: string, data: object) {

        this.type = type;
        this.data = data;
    }
}

export abstract class EventListener {

    public abstract onEventReceived(event: Event): void
}

export class EventDispatcher {

    //private static mListeners = new Array<EventListener>();

    private static mListeners = new Map<EventListener, Set<string>>();

    public static addListener(listener: EventListener, types: Set<string>) {

        EventDispatcher.mListeners.set(listener, types);
    }

    public static removeListener(listener: EventListener) {

        this.mListeners.delete(listener);
    }

    public static dispatchEvent(event: Event) {

        EventDispatcher.mListeners.forEach((value: Set<string>, key: EventListener) => {
            
            if (value.has(event.type)) {

                key.onEventReceived(event);
            }
        });
    }
}