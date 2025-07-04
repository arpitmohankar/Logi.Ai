import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useThemeContext } from '../../providers/ThemeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
