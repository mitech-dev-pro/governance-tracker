import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  dropdownCategory?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  className = "",
  placeholder = "Select an option",
  disabled = false,
  error = false,
  dropdownCategory = "option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current && listRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const listHeight = listRef.current.scrollHeight;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < listHeight && spaceAbove > listHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    } else {
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, value, options]);

  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          onChange(String(options[focusedIndex].value));
          setIsOpen(false);
        }
        break;

      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-1 h-full ${
          disabled
            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            : error
            ? "bg-white border-red-500 text-gray-700 hover:bg-gray-50 focus:ring-red-600 focus:border-red-600 cursor-pointer"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-600 focus:border-red-600 cursor-pointer"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select ${value || placeholder}`}
        disabled={disabled}
      >
        <span
          className={`truncate ${value ? "text-gray-700" : "text-gray-400"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${
            disabled ? "text-gray-400" : error ? "text-red-600" : "text-red-600"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          ref={listRef}
          className={`absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto ${
            dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          role="listbox"
          aria-activedescendant={
            focusedIndex >= 0 ? `option-${focusedIndex}` : undefined
          }
        >
          {options.length === 0
            ? `No ${dropdownCategory} available`
            : options.map((option, index) => (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  id={`option-${index}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(String(option.value));
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full px-3 py-2 text-sm text-left text-gray-700 focus:outline-none cursor-pointer ${
                    focusedIndex === index
                      ? "bg-red-50"
                      : "hover:bg-red-50 focus:bg-gray-50"
                  }`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </button>
              ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
