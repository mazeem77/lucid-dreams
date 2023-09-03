'use client'

import React, { useState } from 'react';

import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { evaluate } from "mathjs";
import { Button } from "./ui/button";

interface TagsData {
  [key: string]: number;
}


const TagInput = () => {
  const [html, setHtml] = useState<JSX.Element | null>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lengthUntil, setLengthUntil] = React.useState(0)
  const [ans, setAns] = useState<string | null>();
  const [equation, setEquation] = useState<string>('0');

  const tagsData: TagsData = {
    "monthlycost": 25,
    "annualcost": 250,
    "revenue": 500,
    "profit": 250
  };

  function calculate(updatedContent: string) {
    const properties = Object.keys(tagsData);
    let transformedString = updatedContent;

    for (const property of properties) {
      const pattern = new RegExp(property, 'g');
      const value = tagsData[property];
      const replacement = value.toString();
      transformedString = transformedString.replace(pattern, replacement);
    }
    setAns(evaluate(transformedString))
  }


  function transformString(input: string): string {
    const properties = Object.keys(tagsData);
    let transformedString = input;

    for (const property of properties) {
      const pattern = new RegExp(property, 'g');
      const replacement = `<span class="dark:text-white text-[#1D283A] bg-transparent border border-[#1D283A] dark:border-gray-500 rounded-md p-1">${property}</span>`;
      transformedString = transformedString.replace(pattern, replacement);
    }
    return transformedString;
  }

  function findMatchingProperties(object: any, partialProperty: any): string[] {
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

    const lastWord = words[words.length - 1];
    const lastOperators = /[+\-*\/]/.exec(lastWord);

    let lengthUntilLastOperator = 0;

    if (lastOperators) {
      const lastOperatorIndex = lastOperators.index;
      lengthUntilLastOperator = lastOperatorIndex >= 0 ? lastOperatorIndex : lastWord.length;
    } else {
      lengthUntilLastOperator = lastWord.length;
    }

    setLengthUntil(lengthUntilLastOperator);

    if (newPartialProperty) {
      const matchingProperties = findMatchingProperties(tagsData, newPartialProperty);
      setSuggestions(matchingProperties);
    } else {
      setSuggestions([]);
    }
  };

  function setValueFunc(content: any) {
    const transformed = transformString(content);
    setHtml(<p dangerouslySetInnerHTML={{ __html: transformed }} />);
  }


  const handleSuggestionSelect = (suggestion: string) => {
    const contentEditable = document.getElementById("inner");

    if (contentEditable) {
      const currentContent = contentEditable.innerText;
      const operatorMatch = currentContent.match(/[-+*/]+$/);
      const lastOperator = operatorMatch ? operatorMatch[0] : '';

      const words = currentContent.trim().split(lastOperator);

      for (let i = 0; i < lengthUntil; i++) {
        words.pop()
      }
      words[words.length] = suggestion;
      const updatedContent = words.join(lastOperator);
      contentEditable.innerText = updatedContent;

      setValueFunc(updatedContent)
      calculate(updatedContent)
      setEquation(updatedContent)

      const range = document.createRange();

      const selection = window.getSelection();

      if (contentEditable.lastChild && selection) {
        range.setStartAfter(contentEditable.lastChild);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    setSuggestions([]);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    suggestFunc(e.target.innerText)
    setValueFunc(e.target.innerText)
  };

  return (
    <div className="flex w-full flex-col items-start justify-center p-4">
      <div className="mb-10 flex h-32 w-[800px] items-center justify-between rounded border border-[#1D283A] bg-gray-300 dark:border-gray-500 dark:bg-[#1D283A]">
        <div className="flex h-12 w-11/12 items-center justify-start overflow-auto px-2">
          {html}
        </div>
        <hr className="h-full w-[1px] border-[#1D283A] bg-[#1D283A] dark:border-gray-500 dark:bg-gray-500" />
        <div className="flex h-12 w-1/12 items-center justify-center">
          {ans}
        </div>
      </div>
      <Command className="w-[800px]">
        <div className="flex h-14 w-full flex-row items-center justify-between rounded-md border border-[#1D283A] bg-gray-300 px-[6px] py-2 dark:border-gray-500 dark:bg-[#1D283A]">
          <div
            contentEditable={true}
            suppressContentEditableWarning={true}
            id="inner"
            className="h-10 w-full rounded-none border border-gray-300 bg-gray-300 p-2 focus:outline-none dark:border-[#1D283A] dark:bg-[#1D283A]"
            onInput={handleInputChange}
          >

          </div>
          <div>
            <Button className="bg-gray-500" onClick={() => { calculate(equation) }}>{'⌘'}</Button><br />
          </div>
        </div>
        {
          suggestions.length !== 0 ?
            <CommandGroup className="border border-[#1D283A]">
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
            </CommandGroup> : <></>
        }
      </Command>
    </div>
  );
};

export default TagInput;
