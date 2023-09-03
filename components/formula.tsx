'use client'

import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { useClickAway } from 'react-use';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";




const TagInput = () => {
  const [html, setHtml] = useState<JSX.Element | null>();
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = React.useState(true)
  const [value, setValue] = React.useState("")
  const [partialValue, setPartialValue] = React.useState("")

  const tagsData = {
    "monthlycost": 25,
    "annualcost": 250,
    "annualycost": 250,
    "revenue": 500,
    "profit": 250
  };

  function transformString(input: string): string {
    const properties = Object.keys(tagsData);
    let transformedString = input;

    for (const property of properties) {
      const pattern = new RegExp(property, 'g');
      const replacement = `<span class="text-white bg-gray-600 border border-white rounded-lg p-1">${property}</span>`;
      transformedString = transformedString.replace(pattern, replacement);
    }

    return transformedString;
  }

  function findMatchingProperties(object: any, partialProperty: any) {
    const matchingProperties = [];

    for (const key in object) {
      if (key.toLowerCase().startsWith(partialProperty.toLowerCase())) {
        matchingProperties.push(key);
      }

      if (typeof object[key] === 'object') {
        matchingProperties.push(...findMatchingProperties(object[key], partialProperty));
      }
    }

    return matchingProperties;
  }

  const suggestFunc = (newValue: string) => {
    const operatorsRegex = /[-+*/]/;
    const words = newValue.trim().split(operatorsRegex);
    const newPartialProperty = words[words.length - 1];

    if (newPartialProperty) {
      const matchingProperties = findMatchingProperties(tagsData, newPartialProperty);
      setSuggestions(matchingProperties);
    } else {
      setSuggestions([]);
    }

    setInputValue(newValue);
  };


  const handleSuggestionSelect = (suggestion: string) => {
    const contentEditable = document.getElementById("inner");

    if (contentEditable) {
      const operatorsRegex = /[-+*/]/;
      const currentContent = contentEditable.innerText;

      const operatorMatch = currentContent.match(/[-+*/]+$/);
      const lastOperator = operatorMatch ? operatorMatch[0] : '';

      const words = currentContent.trim().split(lastOperator);

      words[words.length - 1] = suggestion;

      const updatedContent = words.join(lastOperator);

      contentEditable.innerText = updatedContent;
    }

    // Clear suggestions and close the suggestion box
    setSuggestions([]);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const transformed = transformString(e.target.innerText);
    suggestFunc(e.target.innerText)
    setHtml(<p dangerouslySetInnerHTML={{ __html: transformed }} />);
  };

  return (
    <div className="p-4">
      <div>
        {html}
      </div>
      <Command>
        <div
          contentEditable={true}
          suppressContentEditableWarning={true}
          id="inner"
          className="flex h-10 w-80 items-center border border-white p-4"
          onInput={handleInputChange}
        >
          text
        </div>
        <CommandEmpty>No suggestion found.</CommandEmpty>
        <CommandGroup>
          {suggestions.map((suggestion, index) => (
            <CommandItem
              key={index}
              onSelect={(currentValue) => {
                handleSuggestionSelect(currentValue)
              }}
            >
              {suggestion}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  );
};

export default TagInput;
