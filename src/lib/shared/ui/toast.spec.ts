import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ToastOptionsSpy {
  type?: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  onStatusChange?: (details: { status: string }) => void;
}

const create = vi.fn((_options: ToastOptionsSpy) => 'toast-id');
const dismiss = vi.fn((_id?: string) => undefined);

vi.mock('@skeletonlabs/skeleton-svelte', () => ({
  createToaster: () => ({ create, dismiss }),
}));

const { toastHelper } = await import('./toast');

describe('toastHelper', () => {
  beforeEach(() => {
    create.mockClear();
    dismiss.mockClear();
  });

  it('sends an info toast', () => {
    const id = toastHelper.triggerInfo('hello');

    expect(id).toBe('toast-id');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', description: 'hello' }),
    );
  });

  it('sends an error toast', () => {
    toastHelper.triggerError('boom');

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', description: 'boom' }),
    );
  });

  it('uses an infinite duration when autohide is disabled', () => {
    // Zag only keeps a toast on screen indefinitely for `Infinity`. Any finite
    // value schedules a timer, and one beyond the setTimeout limit overflows
    // and dismisses the toast immediately.
    toastHelper.triggerInfo('stay', { autohide: false });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ duration: Infinity }));
  });

  it('passes a timeout through as the duration', () => {
    toastHelper.triggerInfo('brief', { timeout: 15_000 });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ duration: 15_000 }));
  });

  it('maps an action to zag onClick', () => {
    const response = vi.fn();
    toastHelper.triggerInfo('undo me', { action: { label: 'Undo', response } });

    const action = create.mock.calls[0]?.[0].action;
    expect(action?.label).toBe('Undo');
    action?.onClick();
    expect(response).toHaveBeenCalled();
  });

  it('forwards status changes to the callback', () => {
    const callback = vi.fn();
    toastHelper.triggerInfo('watch me', { callback });

    create.mock.calls[0]?.[0].onStatusChange?.({ status: 'unmounted' });
    expect(callback).toHaveBeenCalledWith({ status: 'unmounted' });
  });

  it('closes a toast by id', () => {
    toastHelper.close('toast-id');

    expect(dismiss).toHaveBeenCalledWith('toast-id');
  });
});
