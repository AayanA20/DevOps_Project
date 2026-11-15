import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateStoryModal from '../components/CreateStoryModal';
import { storyService } from '../services/storyService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'u1', username: 'story_user', profilePicture: '' },
  }),
}));

vi.mock('../services/storyService', () => ({
  storyService: {
    createStory: vi.fn().mockResolvedValue({
      success: true,
      story: { _id: 'story123', mediaUrl: 'https://example.com/pic.jpg', caption: 'Hello Story' },
    }),
  },
}));

describe('CreateStoryModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CreateStoryModal isOpen={false} onClose={vi.fn()} onStoryCreated={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders form and preset options when isOpen is true', () => {
    render(
      <CreateStoryModal isOpen={true} onClose={vi.fn()} onStoryCreated={vi.fn()} />
    );

    expect(screen.getByText('Add to Story')).toBeInTheDocument();
    expect(screen.getByText('Sunset Beach')).toBeInTheDocument();
    expect(screen.getByText('Dev Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i)).toBeInTheDocument();
  });

  it('selects preset and updates form state', () => {
    render(
      <CreateStoryModal isOpen={true} onClose={vi.fn()} onStoryCreated={vi.fn()} />
    );

    const devSetupBtn = screen.getByText('Dev Setup');
    fireEvent.click(devSetupBtn);

    const input = screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i);
    expect(input.value).toContain('photo-1518770660439-4636190af475');
  });

  it('submits form and calls onStoryCreated callback', async () => {
    const onCreatedMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <CreateStoryModal
        isOpen={true}
        onClose={onCloseMock}
        onStoryCreated={onCreatedMock}
      />
    );

    const devSetupBtn = screen.getByText('Dev Setup');
    fireEvent.click(devSetupBtn);

    const submitBtn = screen.getByRole('button', { name: /Share to Story/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(storyService.createStory).toHaveBeenCalledTimes(1);
      expect(onCreatedMock).toHaveBeenCalledTimes(1);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});

