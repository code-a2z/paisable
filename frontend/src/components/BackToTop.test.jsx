import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import BackToTop from './BackToTop';

describe('BackToTop Component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.scrollY = 0;
  });

  it('renders the back-to-top button with correct accessible label', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toBeInTheDocument();
  });

  it('is initially hidden when scrollY is 0', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button.className).toContain('opacity-0');
  });

  it('becomes visible when window is scrolled down past 300px', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: /back to top/i });

    window.scrollY = 450;
    fireEvent.scroll(window);

    expect(button.className).toContain('opacity-100');
  });

  it('calls window.scrollTo with smooth behavior when clicked', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: /back to top/i });

    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
